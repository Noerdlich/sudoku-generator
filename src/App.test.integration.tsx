import { isValidMove, SudokuGrid } from './utils/sudokuGenerator';

// Schnelle Validierungs-Tests für Custom Mode
describe('Custom Mode Validation Logic', () => {
  describe('Row Conflict Detection', () => {
    it('should detect duplicate in same row', () => {
      const grid: SudokuGrid = [
        [5, 5, 0, 0, 0, 0, 0, 0, 0], // Zwei 5en
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];
      
      // Beide 5en sollten invalide sein
      expect(isValidMove(grid.map(r => [...r].map((c, i) => i === 0 ? 0 : c)), 0, 0, 5)).toBe(false);
      expect(isValidMove(grid.map(r => [...r].map((c, i) => i === 1 ? 0 : c)), 0, 1, 5)).toBe(false);
    });
  });

  describe('Column Conflict Detection', () => {
    it('should detect duplicate in same column', () => {
      const grid: SudokuGrid = [
        [7, 0, 0, 0, 0, 0, 0, 0, 0],
        [7, 0, 0, 0, 0, 0, 0, 0, 0], // Zwei 7en in Spalte 0
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];
      
      expect(isValidMove(grid.map((r, i) => i === 0 ? [0, ...r.slice(1)] : r), 0, 0, 7)).toBe(false);
      expect(isValidMove(grid.map((r, i) => i === 1 ? [0, ...r.slice(1)] : r), 1, 0, 7)).toBe(false);
    });
  });

  describe('Block Conflict Detection', () => {
    it('should detect duplicate in same 3x3 block', () => {
      const grid: SudokuGrid = [
        [3, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 3, 0, 0, 0, 0, 0, 0, 0], // Zwei 3en im ersten Block
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];
      
      expect(isValidMove([[0, ...grid[0].slice(1)], ...grid.slice(1)], 0, 0, 3)).toBe(false);
      expect(isValidMove([grid[0], [0, 0, ...grid[1].slice(2)], ...grid.slice(2)], 1, 1, 3)).toBe(false);
    });
  });

  describe('Valid Placements', () => {
    it('should allow valid numbers without conflicts', () => {
      const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(0));
      
      // Leeres Grid sollte alle Zahlen erlauben
      for (let num = 1; num <= 9; num++) {
        expect(isValidMove(grid, 0, 0, num)).toBe(true);
      }
    });

    it('should allow same number in different rows/cols/blocks', () => {
      const grid: SudokuGrid = [
        [1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];
      
      // 1 ist an (0,0), sollte an (1,1) erlaubt sein (andere Zeile, Spalte, Block)
      expect(isValidMove(grid, 1, 1, 1)).toBe(true);
      // Aber nicht in gleicher Zeile
      expect(isValidMove(grid, 0, 1, 1)).toBe(false);
      // Oder gleicher Spalte
      expect(isValidMove(grid, 1, 0, 1)).toBe(false);
    });
  });
});
