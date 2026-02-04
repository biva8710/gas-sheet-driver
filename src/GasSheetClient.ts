import { ISheetDriver } from './interfaces/ISheetDriver';
import { parseA1Notation } from './utils/a1-parser';

export class Range {
  constructor(
    private driver: ISheetDriver,
    private sheetName: string,
    private startRow: number,
    private startCol: number,
    private numRows: number,
    private numCols: number
  ) {}

  getValues(): any[][] {
    return this.driver.getValues(
      this.sheetName,
      this.startRow,
      this.startCol,
      this.numRows,
      this.numCols
    );
  }

  setValues(values: any[][]): void {
    // GAS checks if values dimensions match the range
    if (values.length !== this.numRows || (values[0] && values[0].length !== this.numCols)) {
      throw new Error('The number of rows or columns in the data does not match the range.');
    }
    this.driver.setValues(this.sheetName, this.startRow, this.startCol, values);
  }

  clear(): void {
    this.driver.clear(this.sheetName, this.startRow, this.startCol, this.numRows, this.numCols);
  }

  getRow(): number {
    return this.startRow;
  }

  getColumn(): number {
    return this.startCol;
  }

  getLastRow(): number {
    return this.startRow + this.numRows - 1;
  }

  getLastColumn(): number {
    return this.startCol + this.numCols - 1;
  }
}

export class Sheet {
  constructor(private driver: ISheetDriver, private name: string) {}

  getName(): string {
    return this.name;
  }

  getRange(a1Notation: string): Range;
  getRange(row: number, col: number): Range;
  getRange(row: number, col: number, numRows: number, numCols: number): Range;
  getRange(arg1: string | number, arg2?: number, arg3?: number, arg4?: number): Range {
    if (typeof arg1 === 'string') {
      const parsed = parseA1Notation(arg1);
      const numRows = parsed.numRows ?? (this.driver.getLastRow(this.name) - parsed.startRow + 1);
      const numCols = parsed.numCols ?? (this.driver.getLastColumn(this.name) - parsed.startCol + 1);
      return new Range(this.driver, this.name, parsed.startRow, parsed.startCol, Math.max(0, numRows), Math.max(0, numCols));
    } else {
      const startRow = arg1;
      const startCol = arg2!;
      const numRows = arg3 ?? 1;
      const numCols = arg4 ?? 1;
      return new Range(this.driver, this.name, startRow, startCol, numRows, numCols);
    }
  }

  getLastRow(): number {
    return this.driver.getLastRow(this.name);
  }

  getLastColumn(): number {
    return this.driver.getLastColumn(this.name);
  }

  appendRow(rowContents: any[]): void {
    const lastRow = this.getLastRow();
    this.driver.setValues(this.name, lastRow + 1, 1, [rowContents]);
  }

  clear(): void {
    const lastRow = this.getLastRow();
    const lastCol = this.getLastColumn();
    if (lastRow > 0 && lastCol > 0) {
      this.driver.clear(this.name, 1, 1, lastRow, lastCol);
    }
  }
}

export class GasSheetClient {
  constructor(private driver: ISheetDriver) {}

  getSheetByName(name: string): Sheet | null {
    const names = this.driver.getSheetNames();
    if (names.includes(name)) {
      return new Sheet(this.driver, name);
    }
    return null;
  }

  getSheets(): Sheet[] {
    return this.driver.getSheetNames().map((name) => new Sheet(this.driver, name));
  }

  insertSheet(name: string): Sheet {
    this.driver.addSheet(name);
    return new Sheet(this.driver, name);
  }

  deleteSheet(sheet: Sheet): void {
    this.driver.deleteSheet(sheet.getName());
  }
}
