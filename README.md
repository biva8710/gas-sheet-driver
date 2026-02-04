# gas-sheet-driver

`gas-sheet-driver` は、Google Apps Script (GAS) のスプレッドシート操作を抽象化し、ローカル環境でのテストや開発を容易にするための TypeScript ライブラリです。

## 特徴

- **GAS 互換インターフェース**: `getRange`, `getValues`, `setValues`, `appendRow` など、GAS の `SpreadsheetApp` に近い感覚で操作できます。
- **SQLite によるフェイク実装**: ローカル環境では SQLite (`better-sqlite3`) をバックエンドとして使用し、データの永続化を伴うテストが可能です。
- **TypeScript サポート**: 型定義が完備されており、安全な開発をサポートします。

## インストール

```bash
npm install gas-sheet-driver
```

※ ローカルで `SqliteDriver` を使用する場合、`better-sqlite3` のネイティブ依存関係のビルドが必要になることがあります。

## 基本的な使い方

### 環境に応じたドライバーの切り替え

`gas-sheet-driver` の真価は、本番（GAS）とローカル（Node.js/SQLite）でコードを共通化できる点にあります。

```typescript
import { GasSheetClient, SqliteDriver, GasDriver } from 'gas-sheet-driver';

let driver;

// 環境判定（GAS環境かどうかのチェック）
if (typeof SpreadsheetApp !== 'undefined') {
  // 本番環境 (Google Apps Script)
  driver = new GasDriver(SpreadsheetApp.getActiveSpreadsheet());
} else {
  // ローカル環境 (Node.js / Unit Test)
  driver = new SqliteDriver('local-debug.db');
}

const client = new GasSheetClient(driver);

// 以降のコードは、どちらの環境でも全く同じように動作します
const sheet = client.getSheetByName('Data') || client.insertSheet('Data');
sheet.appendRow([new Date().toISOString(), 'Log Entry']);
```

### クライアントサイドからの利用が想定される場合

もし Web アプリケーションなどで `google.script.run` を介した判定が必要な場合は、以下のようなパターンも有効です。

```typescript
const isGas = typeof google !== 'undefined' && google.script;
// ... 各環境に応じた初期化
```

## アーキテクチャ

このライブラリは「ドライバーパターン」を採用しています。

- `ISheetDriver`: ストレージへのアクセスを抽象化するインターフェース。
- `SqliteDriver`: ローカルテスト用の SQLite 実装。
- `GasSheetClient`: ユーザーが直接操作する高レイヤーのクラス群 (`Sheet`, `Range` を含む)。

## 今後の展望

- `GasDriver`: 実際の GAS 環境（`SpreadsheetApp`）をラップするドライバーの実装。
- A1 記法のより広範なサポート。
- セルの書式設定（背景色など）の限定的なサポート。

## ライセンス

ISC
