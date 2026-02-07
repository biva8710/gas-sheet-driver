# @biva8710/gas-sheet-driver

`@biva8710/gas-sheet-driver` is a toolkit designed to modernize the Google Apps Script (GAS) development experience.
By integrating with Vite, it allows you to fully run and test server-side logic, including Spreadsheet operations, in a local environment (Node.js + SQLite).

[🇯🇵 日本語ドキュメント (Japanese Docs)](./README.ja.md)

## Features

- ⚡ **Zero Config Vite Plugin**: Automatically sets up a GAS execution environment (`google.script.run` emulation) on your local server just by adding the plugin.
- 🔋 **SpreadsheetApp on SQLite**: Performs spreadsheet read/write operations against a local SQLite database. No need to worry about production API quotas during development.
- 🔄 **Universal Code**: Server-side code (`.js` / `.ts`) runs on both GAS and local environments without any specific rewriting.

## Installation

This package is intended for **development environments only**.

```bash
npm install -D @biva8710/gas-sheet-driver
```

## Usage

### 1. Vite Configuration (vite.config.ts)

Importing the Vite plugin will automatically launch the backend GAS logic alongside your local server.

```typescript
import { defineConfig } from 'vite';
import { gasPlugin } from '@biva8710/gas-sheet-driver/vite';

export default defineConfig({
  plugins: [
    gasPlugin({
      // Directory containing GAS code (or array of file paths)
      // default: uses rootDir from .clasp.json
      // include: ['./src'],

      // Local DB file path
      // default: local-dev.db
      // defaultSpreadsheet: 'local-dev.db',
      
      // Initial values injected into PropertiesService.getScriptProperties()
      // default: {}
      // mockProperties: { SSID: 'DEV_SHEET_ID' }
    })
  ]
});
```

### 2. Client-Side Implementation (GasBridge)

Use `GasBridge.run` instead of `google.script.run`.
It supports Promise-based calls and syntax similar to native GAS global function calls.

```typescript
import { GasBridge } from '@biva8710/gas-sheet-driver';

async function loadData() {
  try {
    // Seamlessly call server-side function getDayStatus(date)
    const data = await GasBridge.run.getDayStatus('2026/02/05'); 
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

### 3. Environment Variables & Mock Settings (.env support)

If you place a `.env` file in your project root, the plugin will automatically load it and inject it into `PropertiesService.getScriptProperties()`.

```env
# .env example
SSID=your_spreadsheet_id_for_dev
ADMIN_EMAILS=admin@example.com,test@example.com
```

If used with `mockProperties` in the Vite config, `mockProperties` values take precedence (overwrite).

```typescript
gasPlugin({
  // Explicit mock settings (prioritized over .env)
  mockProperties: {
    DEBUG: 'true'
  }
})
```

### 4. Server-Side Implementation (GAS)

Write code just like normal GAS. The SQLite driver is automatically injected during local execution.

```javascript
function getDayStatus(dateStr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('2024_01');
  // ...
  return result;
}
```

## Supported Features (Emulation)

Currently, a subset of the following features is supported:

- **SpreadsheetApp**:
  - `openById`, `getActiveSpreadsheet`
  - `getSheetByName`, `insertSheet`, `deleteSheet`
  - `getRange`, `getDataRange`
  - `getValues`, `setValues`, `clear`
- **PropertiesService**: `getScriptProperties` (Mock)
- **Utilities**: `formatDate` (Mock)
- **Session**: `getActiveUser`, `getScriptTimeZone` (Mock)
- **Logger**: `log` (aliased to `console.log`)

## TIPS: Customizing Mocks

If the default mocks are insufficient, or if you want to test specific behaviors, you can use the `onContextReady` hook to directly extend or overwrite GAS global objects.

```typescript
gasPlugin({
  onContextReady: (gasContext) => {
    // Example: Overwrite Session.getActiveUser() behavior
    gasContext.Session = {
      getActiveUser: () => ({ 
        getEmail: () => 'admin@example.com' 
      })
    };
    
    // Example: Add a custom class not yet supported
    gasContext.MailApp = {
      sendEmail: (to, subject, body) => {
        console.log(`[MockMail] To: ${to}, Subject: ${subject}`);
      }
    };
  }
})
```

## License

MIT
