import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SqliteDriver } from '../../src/drivers/sqlite/SqliteDriver';
import { GasSheetClient } from '../../src/GasSheetClient';
import fs from 'fs';

describe('GasSheetClient Integration', () => {
  const DB_PATH = 'integration.db';
  let client: GasSheetClient;
  let driver: SqliteDriver;

  beforeEach(() => {
    driver = new SqliteDriver(DB_PATH);
    client = new GasSheetClient(driver);
  });

  afterEach(() => {
    driver.close();
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
    }
  });

  it('should perform GAS-like operations', () => {
    const sheet = client.insertSheet('TestSheet');
    
    // Test setValues and getValues through Range
    const range = sheet.getRange('A1:B2');
    const inputValues = [
      ['ID', 'Name'],
      [1, 'Alice'],
    ];
    range.setValues(inputValues);
    
    expect(sheet.getRange('A1:B2').getValues()).toEqual(inputValues);
    expect(sheet.getLastRow()).toBe(2);
    expect(sheet.getLastColumn()).toBe(2);

    // Test appendRow
    sheet.appendRow([2, 'Bob']);
    expect(sheet.getLastRow()).toBe(3);
    expect(sheet.getRange('A3:B3').getValues()).toEqual([[2, 'Bob']]);

    // Test numeric Range access
    const cellValue = sheet.getRange(2, 2).getValues();
    expect(cellValue).toEqual([['Alice']]);
  });

  it('should handle getRange with A1 notation correctly', () => {
    const sheet = client.insertSheet('A1Test');
    sheet.getRange(1, 1, 5, 5).setValues(
      Array.from({ length: 5 }, (_, i) => 
        Array.from({ length: 5 }, (_, j) => `${i+1}-${j+1}`)
      )
    );

    // Specific range
    expect(sheet.getRange('B2:C3').getValues()).toEqual([
      ['2-2', '2-3'],
      ['3-2', '3-3']
    ]);

    // Single cell
    expect(sheet.getRange('A1').getValues()).toEqual([['1-1']]);
  });
});
