import { generateSudoku, isValidMove, SudokuGrid } from './sudokuGenerator';

describe('Sudoku Generator Tests', () => {
  describe('generateSudoku', () => {
    it('should generate a valid sudoku with puzzle and solution', () => {
      const result = generateSudoku('easy');
      expect(result.puzzle).toBeDefined();
      expect(result.solution).toBeDefined();
      expect(result.puzzle.length).toBe(9);
      expect(result.solution.length).toBe(9);
    });
  });

  describe('isValidMove', () => {
    const testGrid: SudokuGrid = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];

    it('should return true for valid move', () => {
      expect(isValidMove(testGrid, 0, 2, 4)).toBe(true);
    });

    it('should return false for duplicate in row', () => {
      expect(isValidMove(testGrid, 0, 2, 5)).toBe(false);
    });

    it('should return false for duplicate in column', () => {
      expect(isValidMove(testGrid, 0, 2, 8)).toBe(false);
    });
  });
});
