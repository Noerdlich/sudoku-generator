import { generateSudoku, solveSudoku, isValidMove, SudokuGrid } from './sudokuGenerator';

describe('Sudoku Generator Tests', () => {
  describe('generateSudoku', () => {
    it('should generate a valid sudoku with puzzle and solution', () => {
      const result = generateSudoku('medium');
      expect(result.puzzle).toBeDefined();
      expect(result.solution).toBeDefined();
      expect(result.puzzle.length).toBe(9);
      expect(result.solution.length).toBe(9);
    });

    it('should generate different difficulties with correct number of empty cells', () => {
      const easy = generateSudoku('easy');
      const medium = generateSudoku('medium');
      const hard = generateSudoku('hard');

      const countEmpty = (grid: SudokuGrid) => 
        grid.flat().filter(cell => cell === 0).length;

      expect(countEmpty(easy.puzzle)).toBeGreaterThan(30);
      expect(countEmpty(medium.puzzle)).toBeGreaterThan(40);
      expect(countEmpty(hard.puzzle)).toBeGreaterThan(50);
    });

    it('should generate a solvable sudoku', () => {
      const { puzzle, solution } = generateSudoku('medium');
      const solved = solveSudoku(puzzle);
      
      expect(solved.solved).toBe(true);
      expect(JSON.stringify(solved.solution)).toBe(JSON.stringify(solution));
    });
  });

  describe('solveSudoku', () => {
    it('should solve a valid sudoku', () => {
      const puzzle: SudokuGrid = [
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

      const result = solveSudoku(puzzle);
      expect(result.solved).toBe(true);
      
      // Prüfe ob Lösung vollständig ist (keine Nullen)
      const hasZeros = result.solution.flat().some(cell => cell === 0);
      expect(hasZeros).toBe(false);
    });

    it('should return solved=false for invalid sudoku', () => {
      const invalidPuzzle: SudokuGrid = [
        [1, 1, 0, 0, 0, 0, 0, 0, 0], // Zwei 1en in erster Zeile
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      const result = solveSudoku(invalidPuzzle);
      expect(result.solved).toBe(false);
    });

    it('should handle empty grid', () => {
      const emptyGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(0));
      const result = solveSudoku(emptyGrid);
      
      expect(result.solved).toBe(true);
      expect(result.solution.flat().every(cell => cell >= 1 && cell <= 9)).toBe(true);
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
      expect(isValidMove(testGrid, 0, 2, 5)).toBe(false); // 5 bereits in Zeile 0
    });

    it('should return false for duplicate in column', () => {
      expect(isValidMove(testGrid, 0, 2, 8)).toBe(false); // 8 bereits in Spalte 2
    });

    it('should return false for duplicate in 3x3 block', () => {
      expect(isValidMove(testGrid, 0, 2, 9)).toBe(false); // 9 bereits im Block
    });

    it('should validate all numbers 1-9', () => {
      const emptyGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(0));
      
      for (let num = 1; num <= 9; num++) {
        expect(isValidMove(emptyGrid, 0, 0, num)).toBe(true);
      }
    });
  });

  describe('Validation Tests', () => {
    it('should detect row conflicts', () => {
      const grid: SudokuGrid = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      expect(isValidMove(grid, 0, 0, 1)).toBe(false); // 1 bereits in Zeile
      expect(isValidMove(grid, 1, 0, 1)).toBe(true); // Andere Zeile ist ok
    });

    it('should detect column conflicts', () => {
      const grid: SudokuGrid = [
        [1, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 0, 0, 0, 0, 0, 0, 0, 0],
        [4, 0, 0, 0, 0, 0, 0, 0, 0],
        [5, 0, 0, 0, 0, 0, 0, 0, 0],
        [6, 0, 0, 0, 0, 0, 0, 0, 0],
        [7, 0, 0, 0, 0, 0, 0, 0, 0],
        [8, 0, 0, 0, 0, 0, 0, 0, 0],
        [9, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      expect(isValidMove(grid, 0, 0, 1)).toBe(false); // 1 bereits in Spalte
      expect(isValidMove(grid, 0, 1, 1)).toBe(true); // Andere Spalte ist ok
    });

    it('should detect 3x3 block conflicts', () => {
      const grid: SudokuGrid = [
        [1, 2, 3, 0, 0, 0, 0, 0, 0],
        [4, 5, 6, 0, 0, 0, 0, 0, 0],
        [7, 8, 9, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      // Alle Zahlen 1-9 sind bereits im ersten 3x3 Block
      for (let num = 1; num <= 9; num++) {
        expect(isValidMove(grid, 0, 0, num)).toBe(false);
        expect(isValidMove(grid, 1, 1, num)).toBe(false);
        expect(isValidMove(grid, 2, 2, num)).toBe(false);
      }

      // Im zweiten Block sollte 1 gültig sein
      expect(isValidMove(grid, 0, 3, 1)).toBe(true);
    });
  });
});
