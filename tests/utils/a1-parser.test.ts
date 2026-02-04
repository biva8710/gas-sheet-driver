import { describe, it, expect } from 'vitest';
import { columnLetterToIndex, indexToColumnLetter, parseA1Notation } from '../../src/utils/a1-parser';

describe('a1-parser', () => {
  describe('columnLetterToIndex', () => {
    it('should convert letters to indices correctly', () => {
      expect(columnLetterToIndex('A')).toBe(1);
      expect(columnLetterToIndex('Z')).toBe(26);
      expect(columnLetterToIndex('AA')).toBe(27);
      expect(columnLetterToIndex('AZ')).toBe(52);
    });
  });

  describe('indexToColumnLetter', () => {
    it('should convert indices to letters correctly', () => {
      expect(indexToColumnLetter(1)).toBe('A');
      expect(indexToColumnLetter(26)).toBe('Z');
      expect(indexToColumnLetter(27)).toBe('AA');
      expect(indexToColumnLetter(52)).toBe('AZ');
    });
  });

  describe('parseA1Notation', () => {
    it('should parse single cell "A1"', () => {
      expect(parseA1Notation('A1')).toEqual({
        startRow: 1,
        startCol: 1,
        numRows: 1,
        numCols: 1,
      });
    });

    it('should parse range "A1:B2"', () => {
      expect(parseA1Notation('A1:B2')).toEqual({
        startRow: 1,
        startCol: 1,
        endRow: 2,
        endCol: 2,
        numRows: 2,
        numCols: 2,
      });
    });

    it('should parse full column "B:B"', () => {
      const result = parseA1Notation('B:B');
      expect(result.startCol).toBe(2);
      expect(result.endCol).toBe(2);
      expect(result.numCols).toBe(1);
    });

    it('should throw on invalid notation', () => {
      expect(() => parseA1Notation('!!!')).toThrow();
    });
  });
});
