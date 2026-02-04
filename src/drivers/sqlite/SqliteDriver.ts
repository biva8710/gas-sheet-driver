import Database from 'better-sqlite3';
import { ISheetDriver } from '../../interfaces/ISheetDriver';
import { SCHEMA } from './schema';

export class SqliteDriver implements ISheetDriver {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.exec(SCHEMA);
  }

  getValues(
    sheetName: string,
    startRow: number,
    startCol: number,
    numRows: number,
    numCols: number
  ): any[][] {
    const stmt = this.db.prepare(`
      SELECT row, col, value FROM cells
      WHERE sheet_name = ? AND row >= ? AND row < ? AND col >= ? AND col < ?
    `);

    const rows = stmt.all(sheetName, startRow, startRow + numRows, startCol, startCol + numCols) as {
      row: number;
      col: number;
      value: string;
    }[];

    const result: any[][] = Array.from({ length: numRows }, () =>
      Array.from({ length: numCols }, () => '')
    );

    for (const r of rows) {
      const rowIndex = r.row - startRow;
      const colIndex = r.col - startCol;
      try {
        result[rowIndex][colIndex] = JSON.parse(r.value);
      } catch {
        result[rowIndex][colIndex] = r.value;
      }
    }

    return result;
  }

  setValues(
    sheetName: string,
    startRow: number,
    startCol: number,
    values: any[][]
  ): void {
    this.ensureSheetExists(sheetName);

    const upsert = this.db.prepare(`
      INSERT OR REPLACE INTO cells (sheet_name, row, col, value)
      VALUES (?, ?, ?, ?)
    `);

    const transaction = this.db.transaction((data: any[][]) => {
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
          const row = startRow + i;
          const col = startCol + j;
          const val = JSON.stringify(data[i][j]);
          upsert.run(sheetName, row, col, val);
        }
      }
    });

    transaction(values);
  }

  getLastRow(sheetName: string): number {
    const stmt = this.db.prepare('SELECT MAX(row) as lastRow FROM cells WHERE sheet_name = ?');
    const result = stmt.get(sheetName) as { lastRow: number | null };
    return result?.lastRow ?? 0;
  }

  getLastColumn(sheetName: string): number {
    const stmt = this.db.prepare('SELECT MAX(col) as lastCol FROM cells WHERE sheet_name = ?');
    const result = stmt.get(sheetName) as { lastCol: number | null };
    return result?.lastCol ?? 0;
  }

  addSheet(sheetName: string): void {
    const stmt = this.db.prepare('INSERT OR IGNORE INTO sheets (name) VALUES (?)');
    stmt.run(sheetName);
  }

  deleteSheet(sheetName: string): void {
    const deleteCells = this.db.prepare('DELETE FROM cells WHERE sheet_name = ?');
    const deleteSheet = this.db.prepare('DELETE FROM sheets WHERE name = ?');

    this.db.transaction(() => {
      deleteCells.run(sheetName);
      deleteSheet.run(sheetName);
    })();
  }

  getSheetNames(): string[] {
    const stmt = this.db.prepare('SELECT name FROM sheets');
    const rows = stmt.all() as { name: string }[];
    return rows.map((r) => r.name);
  }

  clear(sheetName: string, startRow: number, startCol: number, numRows: number, numCols: number): void {
    const stmt = this.db.prepare(`
      DELETE FROM cells
      WHERE sheet_name = ? AND row >= ? AND row < ? AND col >= ? AND col < ?
    `);
    stmt.run(sheetName, startRow, startRow + numRows, startCol, startCol + numCols);
  }

  private ensureSheetExists(sheetName: string): void {
    this.addSheet(sheetName);
  }

  close(): void {
    this.db.close();
  }
}
