# @biva8710/gas-sheet-driver

`@biva8710/gas-sheet-driver` は、Google Apps Script (GAS) の開発体験をモダンにするためのツールキットです。
Vite と連携して、スプレッドシート操作を含むサーバーサイドロジックをローカル環境（Node.js + SQLite）で完全に動作・テストすることを可能にします。

## 特徴

- ⚡ **Zero Config Vite Plugin**: プラグインを追加するだけで、ローカルサーバー上にGASの実行環境（`google.script.run` エミュレーション）を自動構築します。
- 🔋 **SpreadsheetApp on SQLite**: スプレッドシートの読み書き操作を、ローカルの SQLite データベースに対して行います。本番のAPIクオータを気にする必要はありません。
- 🔄 **Universal Code**: サーバーサイドのコード（`.js` / `.ts`）は、特有の書き換えなしで GAS 環境とローカル環境の両方で動作します。

## インストール

このパッケージは**開発環境専用**です。

```bash
npm install -D @biva8710/gas-sheet-driver
```

## 使い方

### 1. Vite 設定 (vite.config.ts)

Vite プラグインを導入することで、ローカルサーバー起動時にバックエンドのGASロジックも同時に立ち上がります。

```typescript
import { defineConfig } from 'vite';
import { gasPlugin } from '@biva8710/gas-sheet-driver/vite';

export default defineConfig({
  plugins: [
    gasPlugin({
      // GASコードが含まれるディレクトリ（またはファイルパス配列）
      // default: .clasp.json の rootDir を使用
      // include: ['./src'],

      // ローカルDBの保存先
      // default: local-dev.db
      // defaultSpreadsheet: 'local-dev.db',
      
      // PropertiesService.getScriptProperties() に注入される初期値
      // default: {}
      // mockProperties: { SSID: 'DEV_SHEET_ID' }
    })
  ]
});
```

### 2. クライアントサイド実装 (GasBridge)

`google.script.run` の代わりに `GasBridge.run` を使用します。
Promise ベースで呼び出し可能で、かつ GAS 本来のグローバル関数呼び出しに近い記法をサポートしています。

```typescript
import { GasBridge } from '@biva8710/gas-sheet-driver';

async function loadData() {
  try {
    // サーバー側の関数 getDayStatus(date) をシームレスに呼び出す
    const data = await GasBridge.run.getDayStatus('2026/02/05'); 
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

### 3. 環境変数とモック設定 (.env 対応)

プロジェクトルートに `.env` ファイルを配置すると、プラグインが自動的に読み込んで `PropertiesService.getScriptProperties()` に注入します。

```env
# .env の例
SSID=your_spreadsheet_id_for_dev
ADMIN_EMAILS=admin@example.com,test@example.com
```

Vite 設定での `mockProperties` と併用した場合、`mockProperties` の値が優先（上書き）されます。

```typescript
gasPlugin({
  // 明示的なモック設定 (.env より優先)
  mockProperties: {
    DEBUG: 'true'
  }
})
```

### 3. サーバーサイド実装 (GAS)

通常の GAS と同じように記述します。ローカル実行時は自動的に SQLite ドライバが注入されます。

```javascript
function getDayStatus(dateStr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('2024_01');
  // ...
  return result;
}
```

## サポート機能 (エミュレーション)

現在は以下の機能のサブセットをサポートしています。

- **SpreadsheetApp**:
  - `openById`, `getActiveSpreadsheet`
  - `getSheetByName`, `insertSheet`, `deleteSheet`
  - `getRange`, `getDataRange`
  - `getValues`, `setValues`, `clear`
- **PropertiesService**: `getScriptProperties` (Mock)
- **Utilities**: `formatDate` (Mock)
- **Session**: `getActiveUser` (Mock)

## TIPS: モックのカスタマイズ

デフォルトのモックでは不足している場合や、特定の挙動をテストしたい場合は `onContextReady` フックを使って GAS グローバルオブジェクトを直接拡張・上書きできます。

```typescript
gasPlugin({
  onContextReady: (gasContext) => {
    // 例: Session.getActiveUser() の挙動を上書き
    gasContext.Session = {
      getActiveUser: () => ({ 
        getEmail: () => 'admin@example.com' 
      })
    };
    
    // 例: まだサポートされていないクラスを独自に追加
    gasContext.MailApp = {
      sendEmail: (to, subject, body) => {
        console.log(`[MockMail] To: ${to}, Subject: ${subject}`);
      }
    };
  }
})
```

## ライセンス

MIT
