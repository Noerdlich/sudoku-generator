import { generateSudoku, isValidMove, solveSudoku, SudokuGrid } from './sudokuGenerator';

describe('Sudoku Generator Tests', () => {
  describe('generateSudoku', () => {
    it('should generate a valid sudoku with puzzle and solution', () => {
      const result = generateSudoku('easy');
      expect(result.puzzle).toBeDefined();
      expect(result.solution).toBeDefined();
      expect(result.puzzle.length).toBe(9);
      expect(result.solution.length).toBe(9);
    });

    it('should generate different puzzles for easy, medium, hard', () => {
      const easy = generateSudoku('easy');
      const medium = generateSudoku('medium');
      const hard = generateSudoku('hard');

      const countEmpty = (grid: SudokuGrid) => 
        grid.flat().filter(cell => cell === 0).length;

      const easyEmpty = countEmpty(easy.puzzle);
      const mediumEmpty = countEmpty(medium.puzzle);
      const hardEmpty = countEmpty(hard.puzzle);

      // Prüfe die erwarteten Bereiche für jede Schwierigkeit
      // Easy: Ziel 40 entfernt (kann variieren 38-42)
      expect(easyEmpty).toBeGreaterThanOrEqual(38);
      expect(easyEmpty).toBeLessThanOrEqual(42);
      
      // Medium: Ziel 50 entfernt (kann variieren 45-52)
      expect(mediumEmpty).toBeGreaterThanOrEqual(45);
      expect(mediumEmpty).toBeLessThanOrEqual(52);
      
      // Hard: Ziel 56 entfernt (kann variieren 48-58)
      expect(hardEmpty).toBeGreaterThanOrEqual(48);
      expect(hardEmpty).toBeLessThanOrEqual(58);
      
      // Hard sollte im Durchschnitt mehr leere Felder haben als Easy
      expect(hardEmpty).toBeGreaterThanOrEqual(easyEmpty);
    });

    it('should generate solvable puzzles', () => {
      const { puzzle } = generateSudoku('medium');
      const { solved } = solveSudoku(puzzle);
      expect(solved).toBe(true);
    });

    it('should have valid solution that matches puzzle constraints', () => {
      const { puzzle, solution } = generateSudoku('medium');
      
      // Alle vorgegebenen Zahlen im Puzzle müssen in der Lösung gleich sein
      const mismatches = [];
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (puzzle[row][col] !== 0 && solution[row][col] !== puzzle[row][col]) {
            mismatches.push({ row, col, puzzleValue: puzzle[row][col], solutionValue: solution[row][col] });
          }
        }
      }
      
      expect(mismatches).toEqual([]);
    });

    it('should generate complete solution grid', () => {
      const { solution } = generateSudoku('easy');
      const hasEmpty = solution.flat().some(cell => cell === 0);
      expect(hasEmpty).toBe(false);
    });

    it('should not have duplicates in solution rows', () => {
      const { solution } = generateSudoku('medium');
      
      for (let i = 0; i < 9; i++) {
        const row = solution[i];
        const unique = new Set(row);
        expect(unique.size).toBe(9);
      }
    });

    it('should not have duplicates in solution columns', () => {
      const { solution } = generateSudoku('medium');
      
      for (let j = 0; j < 9; j++) {
        const col = solution.map(row => row[j]);
        const unique = new Set(col);
        expect(unique.size).toBe(9);
      }
    });

    it('should not have duplicates in solution 3x3 blocks', () => {
      const { solution } = generateSudoku('medium');
      
      for (let blockRow = 0; blockRow < 3; blockRow++) {
        for (let blockCol = 0; blockCol < 3; blockCol++) {
          const block: number[] = [];
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              block.push(solution[blockRow * 3 + i][blockCol * 3 + j]);
            }
          }
          const unique = new Set(block);
          expect(unique.size).toBe(9);
        }
      }
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

    it('should return false for duplicate in 3x3 block', () => {
      // Position (0,2) ist im selben Block wie (1,1) die eine 6 enthält
      expect(isValidMove(testGrid, 0, 2, 6)).toBe(false);
    });

    it('should allow number already in different block', () => {
      // 4 ist in Zeile 4 und 7, aber nicht in Zeile 0 oder deren Block
      expect(isValidMove(testGrid, 0, 2, 4)).toBe(true);
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

      const { solved, solution } = solveSudoku(puzzle);
      expect(solved).toBe(true);
      expect(solution.flat().every(cell => cell !== 0)).toBe(true);
    });

    it('should not solve invalid sudoku with duplicates', () => {
      const invalidPuzzle: SudokuGrid = [
        [5, 5, 0, 0, 7, 0, 0, 0, 0], // Zwei 5en in der ersten Zeile
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ];

      const { solved } = solveSudoku(invalidPuzzle);
      expect(solved).toBe(false);
    });

    it('should preserve preset values in solution', () => {
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

      const { solution } = solveSudoku(puzzle);
      
      const presetCells: Array<{ puzzleVal: number; solutionVal: number }> = [];
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (puzzle[i][j] !== 0) {
            presetCells.push({ puzzleVal: puzzle[i][j], solutionVal: solution[i][j] });
          }
        }
      }
      
      presetCells.forEach(({ puzzleVal, solutionVal }) => {
        expect(solutionVal).toBe(puzzleVal);
      });
    });
  });
});
