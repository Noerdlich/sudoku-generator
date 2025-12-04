// Gemeinsame Helper-Funktionen für Sudoku-Grid-Operationen
// Diese werden von mehreren Komponenten verwendet

export type SudokuGrid = number[][];

/**
 * Erstellt ein leeres 9x9 Sudoku-Grid
 */
export function createEmptyGrid(): SudokuGrid {
  return Array(9).fill(null).map(() => Array(9).fill(0));
}

/**
 * Kombiniert puzzle (vorgegebene Zahlen) und userGrid (User-Eingaben) zu einem vollständigen Grid
 */
export function createCombinedGrid(puzzle: SudokuGrid, userGrid: SudokuGrid): SudokuGrid {
  return puzzle.map((row, i) =>
    row.map((cell, j) => cell !== 0 ? cell : userGrid[i][j])
  );
}

/**
 * Prüft ob ein Grid vollständig ausgefüllt ist (keine Nullen mehr)
 */
export function isGridComplete(grid: SudokuGrid): boolean {
  return grid.every(row => row.every(cell => cell !== 0));
}

/**
 * Prüft ob ein Grid mit einer gegebenen Lösung übereinstimmt
 */
export function isGridCorrect(grid: SudokuGrid, solution: SudokuGrid): boolean {
  return grid.every((row, i) =>
    row.every((cell, j) => cell === solution[i][j])
  );
}

/**
 * Prüft ob eine Solution leer ist (alle Zellen = 0)
 * Wird für Custom-Modus ohne Lösung verwendet
 */
export function isSolutionEmpty(solution: SudokuGrid): boolean {
  return solution.every(row => row.every(cell => cell === 0));
}

/**
 * Erstellt eine tiefe Kopie eines Grids
 */
export function copyGrid(grid: SudokuGrid): SudokuGrid {
  return grid.map(row => [...row]);
}

/**
 * Prüft ob eine Zahl an einer Position gegen Sudoku-Regeln verstößt
 * (ohne die Zelle selbst zu berücksichtigen)
 */
export function hasConflict(
  grid: SudokuGrid,
  row: number,
  col: number,
  num: number
): boolean {
  // Prüfe Zeile
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === num) return true;
  }
  
  // Prüfe Spalte
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === num) return true;
  }
  
  // Prüfe 3x3 Block
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c] === num) return true;
    }
  }
  
  return false;
}

/**
 * Generiert alle Zellenpositionen für eine Zeile
 */
export function getRowCells(row: number): [number, number][] {
  const cells: [number, number][] = [];
  for (let col = 0; col < 9; col++) {
    cells.push([row, col]);
  }
  return cells;
}

/**
 * Generiert alle Zellenpositionen für eine Spalte
 */
export function getColumnCells(col: number): [number, number][] {
  const cells: [number, number][] = [];
  for (let row = 0; row < 9; row++) {
    cells.push([row, col]);
  }
  return cells;
}

/**
 * Generiert alle Zellenpositionen für einen 3x3 Block
 */
export function getBlockCells(blockRow: number, blockCol: number): [number, number][] {
  const cells: [number, number][] = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const row = blockRow * 3 + i;
      const col = blockCol * 3 + j;
      cells.push([row, col]);
    }
  }
  return cells;
}

/**
 * Berechnet den Block-Index (0-2) für eine gegebene Zeilen- oder Spaltenposition
 */
export function getBlockIndex(position: number): number {
  return Math.floor(position / 3);
}
