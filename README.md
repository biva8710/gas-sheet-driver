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

本番の GAS コードを一切変更せずに、ローカル環境（Node.js）で実行するためのセットアップ例です。

```typescript
import { GasSheetClient, SqliteDriver } from 'gas-sheet-driver';

/**
 * 1. 開発環境（Node.js）の場合のみ、グローバルオブジェクトをモックする
 */
if (typeof SpreadsheetApp === 'undefined') {
  const driver = new SqliteDriver('local-debug.db');
  const client = new GasSheetClient(driver);

  // SpreadsheetApp という名前でグローバルに登録（なりすまし）
  (global as any).SpreadsheetApp = {
    getActiveSpreadsheet: () => client,
    openById: () => client,
    WrapStrategy: GasSheetClient.WrapStrategy
  };
  
  // 必要に応じて他のサービスもモック
  (global as any).PropertiesService = {
    getScriptProperties: () => ({ getProperty: (key: string) => 'DUMMY_ID' })
  };
}

/**
 * 2. クライアントサイドでの利用 (GasBridge)
 * google.script.run の代わりに GasBridge.run を使用することで、
 * ローカル環境ではグローバル関数を直接呼び出し、GAS環境ではサーバーサイド関数を呼び出します。
 */
import { GasBridge } from 'gas-sheet-driver';

function fetchSeatStatuses(dateString) {
  GasBridge.run.getDayStatus(dateString)
    .then(updateAllSeats)
    .catch(onFailure);
}

/**
 * 3. 本番の GAS コード（サーバーサイド）
 */
function getDayStatus(dateStr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // ...
}
```

### このアプローチのメリット
- **本番コードへの依存ゼロ**: GAS 環境ではこのライブラリは存在しないため、一切の影響を与えません。
- **シームレスな移行**: `createNextMonthSheet` のような複雑なロジックを、そのままローカルの `vitest` などでテストできます。
- **Promise サポート**: `GasBridge` を使うことで、GAS の非同期呼び出しを `async/await` や `.then().catch()` でモダンに記述できます。


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
