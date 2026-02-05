/**
 * GasBridge for Browser (Client-side)
 * 
 * Injects 'GasBridge' into the global window object.
 * Handles switching between GAS (google.script.run) and Local Dev Server (fetch).
 */

declare const google: any;
declare const window: any;

const GasBridge = {
    /**
     * Call a server-side function.
     * @param funcName Function name to call
     * @param args Arguments
     */
    call(funcName: string, ...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            // 1. GAS Environment
            if (typeof google !== 'undefined' && google.script && google.script.run) {
                google.script.run
                    .withSuccessHandler(resolve)
                    .withFailureHandler(reject)
                [funcName](...args);
            }
            // 2. Local Development (via Vite Middleware)
            else {
                // Assume Vite middleware is listening at /__gas/run
                const endpoint = '/__gas/run';

                fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ functionName: funcName, args })
                })
                    .then(async (res) => {
                        if (!res.ok) {
                            const json = await res.json().catch(() => ({}));
                            throw new Error((json as any).error || `Server Error: ${res.status}`);
                        }
                        return res.json();
                    })
                    .then(json => {
                        if ((json as any).error) throw new Error((json as any).error);
                        resolve((json as any).data);
                    })
                    .catch(reject);
            }
        });
    },

    /**
     * Proxied access to server functions, matching google.script.run behavior.
     */
    run: new Proxy({} as any, {
        get(_, prop: string) {
            return (...args: any[]) => GasBridge.call(prop, ...args);
        }
    })
};

// Expose to global
if (typeof window !== 'undefined') {
    window.GasBridge = GasBridge;
}

export { GasBridge };
