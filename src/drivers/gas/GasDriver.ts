import { ISheetDriver } from '../../interfaces/ISheetDriver';

/**
 * Driver implementation for the actual Google Apps Script environment.
 * Wraps SpreadsheetApp.
 */
export class GasDriver implements ISheetDriver {
  constructor(private spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet) {}

  getValues(
    sheetName: string,
    startRow: number,
    startCol: number,
    numRows: number,
    numCols: number
  ): any[][] {
    const sheet = this.spreadsheet.getSheetByName(sheetName);
    if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
    return sheet.getRange(startRow, startCol, numRows, numCols).getValues();
  }

  setValues(
    sheetName: string,
    startRow: number,
    startCol: number,
    values: any[][]
  ): void {
    const sheet = this.spreadsheet.getSheetByName(sheetName);
    if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
    sheet.getRange(startRow, startCol, values.length, values[0].length).setValues(values);
  }

  getLastRow(sheetName: string): number {
    const sheet = this.spreadsheet.getSheetByName(sheetName);
    return sheet ? sheet.getLastRow() : 0;
  }

  getLastColumn(sheetName: string): number {
    const sheet = this.spreadsheet.getSheetByName(sheetName);
    return sheet ? sheet.getLastColumn() : 0;
  }

  addSheet(sheetName: string): void {
    this.spreadsheet.insertSheet(sheetName);
  }

  deleteSheet(sheetName: string): void {
    const sheet = this.spreadsheet.getSheetByName(sheetName);
    if (sheet) {
      this.spreadsheet.deleteSheet(sheet);
    }
  }

  getSheetNames(): string[] {
    return this.spreadsheet.getSheets().map((s) => s.getName());
  }

  clear(sheetName: string, startRow: number, startCol: number, numRows: number, numCols: number): void {
    const sheet = this.spreadsheet.getSheetByName(sheetName);
    if (sheet) {
      sheet.getRange(startRow, startCol, numRows, numCols).clear();
    }
  }
}
