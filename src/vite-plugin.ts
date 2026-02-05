import type { Plugin, ViteDevServer } from 'vite';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { SqliteDriver } from './drivers/sqlite/SqliteDriver';
import { GasSheetClient } from './GasSheetClient';
import { MockPropertiesService } from './mocks/MockPropertiesService';
import { MockSession } from './mocks/MockSession';
import { MockUtilities } from './mocks/MockUtilities';

interface GasPluginOptions {
    /** Path to the GAS script file(s). If omitted, attempts to read .clasp.json */
    scriptPath?: string | string[];
    /** Path to the SQLite database file */
    dbPath?: string;
    /** Initial SSID for mock properties */
    mockSsid?: string;
    /** Callback fired when GAS context is initialized */
    onContextReady?: (context: any) => void;
}

export function gasPlugin(options: GasPluginOptions = {}): Plugin {
    const {
        dbPath = 'local-dev.db',
        mockSsid = 'DEV_SHEET_ID',
        onContextReady
    } = options;

    let gasContext: any = null;
    let scriptFiles: string[] = [];

    // Helper to find script files from .clasp.json
    function resolveScriptFiles(cwd: string): string[] {
        if (options.scriptPath) {
            const files = Array.isArray(options.scriptPath) ? options.scriptPath : [options.scriptPath];
            return files.map(f => path.resolve(cwd, f));
        }

        // Try .clasp.json
        const claspJsonPath = path.resolve(cwd, '.clasp.json');
        if (fs.existsSync(claspJsonPath)) {
            try {
                const claspConfig = JSON.parse(fs.readFileSync(claspJsonPath, 'utf8'));
                if (claspConfig.rootDir) {
                    const rootDir = path.resolve(cwd, claspConfig.rootDir);
                    if (fs.existsSync(rootDir)) {
                        // Find all .js files in rootDir (non-recursive for now to match typical GAS structure flat-ish)
                        // GAS projects often have files in subdirectories too.
                        // For simplicity, let's look for .js files in rootDir and subdirs.
                        // But for this project, src/sheet.js is the main logic.
                        return findJsFiles(rootDir);
                    }
                }
            } catch (e) {
                console.warn('[GasPlugin] Failed to read .clasp.json:', e);
            }
        }

        // Fallback
        const srcSheet = path.resolve(cwd, 'src/sheet.js');
        if (fs.existsSync(srcSheet)) return [srcSheet];

        return [];
    }

    function findJsFiles(dir: string): string[] {
        let results: string[] = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.resolve(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                results = results.concat(findJsFiles(filePath));
            } else if (file.endsWith('.js') && !file.endsWith('.test.js') && file !== 'gas-polyfill.js' && file !== 'gas-bridge.js') {
                results.push(filePath);
            }
        });
        return results;
    }

    return {
        name: 'gas-sheet-driver-plugin',

        configureServer(server: ViteDevServer) {
            // --- 1. GAS Context Initialization ---
            try {
                const cwd = process.cwd();
                const absDbPath = path.resolve(cwd, dbPath);
                scriptFiles = resolveScriptFiles(cwd);

                console.log('[GasPlugin] DB Path:', absDbPath);
                console.log('[GasPlugin] Loading Scripts:', scriptFiles.map(f => path.relative(cwd, f)).join(', '));

                if (scriptFiles.length === 0) {
                    console.warn('[GasPlugin] No script files found. Backend logic will not work.');
                }

                const driver = new SqliteDriver(absDbPath);
                const client = new GasSheetClient(driver);

                const sandbox = {
                    SpreadsheetApp: {
                        getActiveSpreadsheet: () => client,
                        openById: () => client,
                        WrapStrategy: GasSheetClient.WrapStrategy,
                    },
                    PropertiesService: {
                        getScriptProperties: () => new MockPropertiesService({ SSID: mockSsid }).getScriptProperties()
                    },
                    Session: new MockSession('dev-user@example.com'),
                    Utilities: new MockUtilities(),
                    Logger: { log: console.log },
                    console: console,
                };

                gasContext = vm.createContext(sandbox);

                // Load all scripts into the same context
                scriptFiles.forEach(file => {
                    const code = fs.readFileSync(file, 'utf8');
                    vm.runInContext(code, gasContext);
                });
                console.log('[GasPlugin] GAS Context initialized.');

                // --- Default Initialization Logic ---
                // 1. Create Next Month (if function exists)
                if (typeof gasContext.createNextMonthSheet === 'function') {
                    gasContext.createNextMonthSheet();
                }
                // 2. Create Current Month (Generic Helper)
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = ("0" + (today.getMonth() + 1)).slice(-2);
                // Attempt to guess sheet name format yyyy_mm (used in this project)
                const sheetName = `${yyyy}_${mm}`;
                const ss = sandbox.SpreadsheetApp.openById(mockSsid);
                if (!ss.getSheetByName(sheetName)) {
                    // console.log(`[GasPlugin] Auto-creating current month sheet: ${sheetName}`);
                    const sheet = ss.insertSheet(sheetName);
                    // Initialize 70 seats (Generic enough?)
                    const seats = Array.from({ length: 70 }, (_, i) => [i + 1]);
                    sheet.getRange(2, 1, 70, 1).setValues(seats);
                }

                // User Custom Callback
                if (onContextReady) {
                    onContextReady(gasContext);
                }

            } catch (e) {
                console.error('[GasPlugin] Failed to initialize GAS context:', e);
            }

            // --- 2. Middleware to handle GAS calls ---
            server.middlewares.use((req, res, next) => {
                const url = req.originalUrl || req.url || '';

                if (url === '/gas-bridge.js') {
                    const bridgePath = path.resolve(__dirname, 'browser.global.js');
                    if (fs.existsSync(bridgePath)) {
                        res.setHeader('Content-Type', 'application/javascript');
                        res.end(fs.readFileSync(bridgePath));
                        return;
                    }
                }

                if (url === '/browser.global.js.map') {
                    const mapPath = path.resolve(__dirname, 'browser.global.js.map');
                    if (fs.existsSync(mapPath)) {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(fs.readFileSync(mapPath));
                        return;
                    }
                }

                if (url.includes('__gas/run') && req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => { body += chunk; });
                    req.on('end', async () => {
                        try {
                            if (!body) throw new Error('Empty request body');
                            const { functionName, args } = JSON.parse(body);

                            // Debug log
                            // console.log(`[GasPlugin] Call: ${functionName}`);

                            if (!gasContext || typeof gasContext[functionName] !== 'function') {
                                throw new Error(`Function "${functionName}" not found in GAS context.`);
                            }

                            const result = gasContext[functionName](...args || []);
                            const finalResult = result instanceof Promise ? await result : result;

                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ data: finalResult }));
                        } catch (error: any) {
                            console.error('[GasPlugin] Error:', error);
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ error: error.message }));
                        }
                    });
                    return;
                }

                next();
            });
        },

        transformIndexHtml(html) {
            return html.replace(
                '</body>',
                '<script src="/gas-bridge.js"></script></body>'
            );
        }
    };
}
