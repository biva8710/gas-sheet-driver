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

### ローカル環境でのテスト (SQLite)

```typescript
import { GasSheetClient, SqliteDriver } from 'gas-sheet-driver';

// SQLite ドライバーの初期化
const driver = new SqliteDriver('test-data.db');
const client = new GasSheetClient(driver);

// シートの取得・作成
const sheet = client.insertSheet('Users');

// データの書き込み
sheet.getRange('A1:B1').setValues([['ID', 'Name']]);
sheet.appendRow([1, 'Alice']);

// データの読み込み
const values = sheet.getRange('A1:B2').getValues();
console.log(values); // [['ID', 'Name'], [1, 'Alice']]

// リソースの解放
driver.close();
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
