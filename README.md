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

### ローカル開発・テストでの利用 (Polyfill アプローチ)

本番の GAS コードを一切変更せずに、ローカル環境で実行するためのセットアップ例です。

```typescript
import { GasSheetClient, SqliteDriver } from 'gas-sheet-driver';

// 1. SQLite ドライバーの初期化
const driver = new SqliteDriver('local.db');
const client = new GasSheetClient(driver);

// 2. グローバルオブジェクトのモック (Polyfill)
// これにより、SpreadsheetApp.getActiveSpreadsheet() 等がローカルで動作します
global.SpreadsheetApp = {
  getActiveSpreadsheet: () => client,
  openById: () => client,
  WrapStrategy: GasSheetClient.WrapStrategy
} as any;

// 3. 本番の GAS スクリプトを呼び出す
// createNextMonthSheet(); 
```

### メリット
- **本番コードへの依存ゼロ**: 本番環境ではこのライブラリをロードする必要はありません。
- **メンテナンス性**: Google の API 更新時も、本番コードには一切影響しません。ローカルで新機能のスタブが必要になった場合のみ、このライブラリを拡張します。


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
