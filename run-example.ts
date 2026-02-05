import { GasSheetClient, SqliteDriver } from './src';

// --- 1. ローカル環境のセットアップ (Polyfill) ---
const driver = new SqliteDriver('debug.db');
const client = new GasSheetClient(driver);

(global as any).SpreadsheetApp = {
  getActiveSpreadsheet: () => client,
  openById: () => client,
  WrapStrategy: { CLIP: 'CLIP' }
};

// --- 2. あなたのスクリプト (そのまま貼り付け) ---
function testLogic() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('2026_02');
  if (!sheet) {
    sheet = ss.insertSheet('2026_02');
  }

  console.log('データを書き込み中...');
  sheet.getRange("A1").setValue("SeatNo").setFontWeight("bold");
  
  const seats = [[1], [2], [3]];
  sheet.getRange(2, 1, 3, 1).setValues(seats);

  console.log('書き込まれたデータを確認中...');
  const values = sheet.getRange("A1:A4").getValues();
  console.log('取得データ:', JSON.stringify(values));
  
  console.log('最終行:', sheet.getLastRow());
}

// --- 3. 実行 ---
try {
  testLogic();
  console.log('実行成功！ debug.db が作成されました。');
} catch (e) {
  console.error('エラー発生:', e);
} finally {
  driver.close();
}
