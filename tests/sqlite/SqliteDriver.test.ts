import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SqliteDriver } from '../../src/drivers/sqlite/SqliteDriver';
import fs from 'fs';

describe('SqliteDriver', () => {
  const DB_PATH = 'test.db';
  let driver: SqliteDriver;

  beforeEach(() => {
    driver = new SqliteDriver(DB_PATH);
  });

  afterEach(() => {
    driver.close();
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
    }
  });

  it('should set and get values correctly', () => {
    const sheetName = 'Sheet1';
    const values = [
      ['Name', 'Age'],
      ['Alice', 30],
      ['Bob', 25],
    ];

    driver.setValues(sheetName, 1, 1, values);
    const result = driver.getValues(sheetName, 1, 1, 3, 2);

    expect(result).toEqual(values);
  });

  it('should get last row and column correctly', () => {
    const sheetName = 'Sheet1';
    driver.setValues(sheetName, 5, 3, [['Data']]);

    expect(driver.getLastRow(sheetName)).toBe(5);
    expect(driver.getLastColumn(sheetName)).toBe(3);
  });

  it('should handle multiple sheets', () => {
    driver.addSheet('Sheet1');
    driver.addSheet('Sheet2');
    
    expect(driver.getSheetNames()).toContain('Sheet1');
    expect(driver.getSheetNames()).toContain('Sheet2');

    driver.setValues('Sheet1', 1, 1, [['S1']]);
    driver.setValues('Sheet2', 1, 1, [['S2']]);

    expect(driver.getValues('Sheet1', 1, 1, 1, 1)).toEqual([['S1']]);
    expect(driver.getValues('Sheet2', 1, 1, 1, 1)).toEqual([['S2']]);
  });

  it('should delete a sheet', () => {
    driver.addSheet('Sheet1');
    driver.setValues('Sheet1', 1, 1, [['Data']]);
    driver.deleteSheet('Sheet1');

    expect(driver.getSheetNames()).not.toContain('Sheet1');
    expect(driver.getLastRow('Sheet1')).toBe(0);
  });
});
