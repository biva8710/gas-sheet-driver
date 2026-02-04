/**
 * Interface for sheet data access.
 * Abstracts the underlying storage (GAS SpreadsheetApp or SQLite).
 */
export interface ISheetDriver {
  /**
   * Retrieves values from a specific range in a sheet.
   * @param sheetName The name of the sheet.
   * @param startRow 1-based start row index.
   * @param startCol 1-based start column index.
   * @param numRows Number of rows to retrieve.
   * @param numCols Number of columns to retrieve.
   */
  getValues(
    sheetName: string,
    startRow: number,
    startCol: number,
    numRows: number,
    numCols: number
  ): any[][];

  /**
   * Sets values in a specific range in a sheet.
   * @param sheetName The name of the sheet.
   * @param startRow 1-based start row index.
   * @param startCol 1-based start column index.
   * @param values 2D array of values to set.
   */
  setValues(
    sheetName: string,
    startRow: number,
    startCol: number,
    values: any[][]
  ): void;

  /**
   * Gets the last row index that has content.
   * @param sheetName The name of the sheet.
   */
  getLastRow(sheetName: string): number;

  /**
   * Gets the last column index that has content.
   * @param sheetName The name of the sheet.
   */
  getLastColumn(sheetName: string): number;

  /**
   * Creates a new sheet with the given name.
   * @param sheetName The name of the sheet to create.
   */
  addSheet(sheetName: string): void;

  /**
   * Deletes a sheet with the given name.
   * @param sheetName The name of the sheet to delete.
   */
  deleteSheet(sheetName: string): void;

  /**
   * Gets all sheet names in the spreadsheet.
   */
  getSheetNames(): string[];

  /**
   * Clears a specific range.
   */
  clear(sheetName: string, startRow: number, startCol: number, numRows: number, numCols: number): void;
}
