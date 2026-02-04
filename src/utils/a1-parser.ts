/**
 * Converts a column letter (e.g., "A", "AB") to a 1-based index.
 */
export function columnLetterToIndex(letter: string): number {
  let index = 0;
  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + (letter.charCodeAt(i) - 64);
  }
  return index;
}

/**
 * Converts a 1-based index to a column letter.
 */
export function indexToColumnLetter(index: number): string {
  let letter = '';
  while (index > 0) {
    const temp = (index - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    index = Math.floor((index - temp) / 26);
  }
  return letter;
}

export interface ParsedRange {
  startRow: number;
  startCol: number;
  endRow?: number;
  endCol?: number;
  numRows?: number;
  numCols?: number;
}

/**
 * Parses an A1 notation string into row and column indices.
 * Supports: "A1", "A1:B2", "A:A", "1:1"
 */
export function parseA1Notation(a1: string): ParsedRange {
  const rangeRegex = /^([A-Z]*)([0-9]*)(?::([A-Z]*)([0-9]*))?$/i;
  const match = a1.match(rangeRegex);

  if (!match) {
    throw new Error(`Invalid A1 notation: ${a1}`);
  }

  const [, col1, row1, col2, row2] = match;

  const startCol = col1 ? columnLetterToIndex(col1.toUpperCase()) : 1;
  const startRow = row1 ? parseInt(row1, 10) : 1;

  if (!col2 && !row2) {
    return { startRow, startCol, numRows: 1, numCols: 1 };
  }

  const endCol = col2 ? columnLetterToIndex(col2.toUpperCase()) : (col1 ? startCol : undefined);
  const endRow = row2 ? parseInt(row2, 10) : (row1 ? startRow : undefined);

  const result: ParsedRange = { startRow, startCol };

  if (endRow !== undefined) {
    result.endRow = endRow;
    result.numRows = endRow - startRow + 1;
  }
  if (endCol !== undefined) {
    result.endCol = endCol;
    result.numCols = endCol - startCol + 1;
  }

  return result;
}
