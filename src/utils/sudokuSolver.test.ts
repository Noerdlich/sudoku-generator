/**
 * Tests für die Sudoku Solver Strategien
 * 
 * Diese Tests prüfen:
 * 1. Basis-Funktionalität (getCandidates)
 * 2. Einfache Strategien (Naked Single, Hidden Single)
 * 3. Mittlere Strategien (Naked Pair/Triple, Pointing Pairs, Box Line Reduction)
 * 4. Integration aller Strategien
 */

import {
  getCandidates,
  findNakedSingle,
  findHiddenSingle,
  findNakedPair,
  findNakedTriple,
  findPointingPairs,
  findBoxLineReduction,
  SudokuGrid,
} from './sudokuSolver';

describe('sudokuSolver', () => {
  // ========== Tests für getCandidates ==========
  describe('getCandidates', () => {
    test('sollte alle Kandidaten für eine leere Zelle zurückgeben', () => {
      // Ein fast leeres Grid - nur eine 1 in der ersten Zelle
      const grid: SudokuGrid = [
        [1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ];

      // Zelle (0,1) sollte alle Zahlen außer 1 als Kandidaten haben
      const candidates = getCandidates(grid, 0, 1);
      expect(candidates).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    });

    test('sollte keine Kandidaten für gefüllte Zellen zurückgeben', () => {
      const grid: SudokuGrid = [
        [1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ];

      const candidates = getCandidates(grid, 0, 0);
      expect(candidates).toEqual([]);
    });

    test('sollte Kandidaten basierend auf Zeile, Spalte und Block eliminieren', () => {
      const grid: SudokuGrid = [
        [1, 2, 3, 0, 0, 0, 0, 0, 0],
        [4, 5, 6, 0, 0, 0, 0, 0, 0],
        [7, 8, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ];

      // Zelle (2,2) ist im ersten Block, wo bereits 1-8 vorkommen
      // Also kann nur 9 dort stehen
      const candidates = getCandidates(grid, 2, 2);
      expect(candidates).toEqual([9]);
    });
  });

  // ========== Tests für Naked Single ==========
  describe('findNakedSingle', () => {
    test('sollte einen Naked Single finden', () => {
      // Grid mit nur einer möglichen Zahl in Zelle (2,2)
      const grid: SudokuGrid = [
        [1, 2, 3, 0, 0, 0, 0, 0, 0],
        [4, 5, 6, 0, 0, 0, 0, 0, 0],
        [7, 8, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ];

      const result = findNakedSingle(grid);
      expect(result).not.toBeNull();
      expect(result?.row).toBe(2);
      expect(result?.col).toBe(2);
      expect(result?.value).toBe(9);
      expect(result?.strategy).toBe('Naked Single');
      expect(result?.difficulty).toBe('easy');
    });

    test('sollte null zurückgeben, wenn kein Naked Single existiert', () => {
      // Leeres Grid - jede Zelle hat 9 Kandidaten
      const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(0));

      const result = findNakedSingle(grid);
      expect(result).toBeNull();
    });

    test('sollte bei einem fast vollständigen Sudoku einen Naked Single finden', () => {
      // Ein Sudoku mit nur einer fehlenden Zahl
      const grid: SudokuGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 0], // Nur (8,8) fehlt
      ];

      const result = findNakedSingle(grid);
      expect(result).not.toBeNull();
      expect(result?.row).toBe(8);
      expect(result?.col).toBe(8);
      expect(result?.value).toBe(9);
    });
  });

  // ========== Tests für Hidden Single ==========
  describe('findHiddenSingle', () => {
    test('sollte einen Hidden Single in einer Zeile finden', () => {
      // In Zeile 0 kann die 9 nur in Spalte 3 stehen
      // Aber alle anderen Spalten in Zeile 0 müssen auch eine 9 ausschließen können
      const grid: SudokuGrid = [
        [1, 2, 3, 0, 5, 6, 7, 8, 4], // 9 fehlt, kann nur in Spalte 3
        [9, 0, 0, 0, 0, 0, 0, 0, 0], // 9 in Spalte 0
        [0, 9, 0, 0, 0, 0, 0, 0, 0], // 9 in Spalte 1
        [0, 0, 9, 0, 0, 0, 0, 0, 0], // 9 in Spalte 2
        [0, 0, 0, 0, 9, 0, 0, 0, 0], // 9 in Spalte 4
        [0, 0, 0, 0, 0, 9, 0, 0, 0], // 9 in Spalte 5
        [0, 0, 0, 0, 0, 0, 9, 0, 0], // 9 in Spalte 6
        [0, 0, 0, 0, 0, 0, 0, 9, 0], // 9 in Spalte 7
        [0, 0, 0, 0, 0, 0, 0, 0, 9], // 9 in Spalte 8
      ];

      const result = findHiddenSingle(grid);
      expect(result).not.toBeNull();
      expect(result?.value).toBe(9);
      expect(result?.strategy).toBe('Hidden Single');
      expect(result?.difficulty).toBe('easy');
    });

    test('sollte einen Hidden Single in einem Block finden', () => {
      // Im ersten Block (0,0) kann die 9 nur in Zelle (2,2)
      const grid: SudokuGrid = [
        [1, 2, 3, 0, 0, 0, 0, 0, 0],
        [4, 5, 6, 0, 0, 0, 0, 0, 0],
        [7, 8, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ];

      const result = findHiddenSingle(grid);
      expect(result).not.toBeNull();
      expect(result?.row).toBe(2);
      expect(result?.col).toBe(2);
      expect(result?.value).toBe(9);
    });

    test('sollte null zurückgeben, wenn kein Hidden Single existiert', () => {
      const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(0));
      const result = findHiddenSingle(grid);
      expect(result).toBeNull();
    });
  });

  // ========== Tests für komplexere Strategien ==========
  describe('Erweiterte Strategien', () => {
    test('findNakedPair sollte bei leerem Grid null zurückgeben', () => {
      const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(0));
      const result = findNakedPair(grid);
      expect(result).toBeNull();
    });

    test('findNakedTriple sollte bei leerem Grid null zurückgeben', () => {
      const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(0));
      const result = findNakedTriple(grid);
      expect(result).toBeNull();
    });

    test('findPointingPairs sollte bei leerem Grid null zurückgeben', () => {
      const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(0));
      const result = findPointingPairs(grid);
      expect(result).toBeNull();
    });

    test('findBoxLineReduction sollte bei leerem Grid null zurückgeben', () => {
      const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(0));
      const result = findBoxLineReduction(grid);
      expect(result).toBeNull();
    });
  });

  // ========== Integration Tests ==========
  describe('Integration Tests', () => {
    const testGrid: SudokuGrid = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ];

    test('Naked Single gibt HintResult oder null zurück', () => {
      const result = findNakedSingle(testGrid);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('Hidden Single gibt HintResult oder null zurück', () => {
      const result = findHiddenSingle(testGrid);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('Naked Pair gibt HintResult oder null zurück', () => {
      const result = findNakedPair(testGrid);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('Naked Triple gibt HintResult oder null zurück', () => {
      const result = findNakedTriple(testGrid);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('Pointing Pairs gibt HintResult oder null zurück', () => {
      const result = findPointingPairs(testGrid);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('Box Line Reduction gibt HintResult oder null zurück', () => {
      const result = findBoxLineReduction(testGrid);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('sollte bei einem teilweise gefüllten Sudoku mindestens eine Strategie anwenden können', () => {
      const grid: SudokuGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 0], // Nur (8,8) fehlt
      ];

      // Mindestens Naked Single sollte die letzte Zelle finden
      const result = findNakedSingle(grid);
      expect(result).not.toBeNull();
      expect(result?.row).toBe(8);
      expect(result?.col).toBe(8);
      expect(result?.value).toBe(9);
    });

    test('HintResults haben gültige Struktur wenn vorhanden', () => {
      // Verwende ein fast vollständiges Grid, das garantiert ein Ergebnis liefert
      const grid: SudokuGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 0], // Nur (8,8) fehlt
      ];

      // Naked Single sollte definitiv ein Ergebnis liefern
      const result = findNakedSingle(grid);
      
      expect(result).not.toBeNull();
      // TypeScript weiß jetzt, dass result nicht null ist
      expect(result!.row).toBe(8);
      expect(result!.col).toBe(8);
      expect(result!.value).toBe(9);
      expect(result!.explanation.length).toBeGreaterThan(0);
      expect(['easy', 'medium', 'hard']).toContain(result!.difficulty);
    });
  });
});
