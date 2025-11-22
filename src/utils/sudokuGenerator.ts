// Sudoku Generator mit Backtracking-Algorithmus
// Generiert lösbare und symmetrische 9x9 Sudokus

export type SudokuGrid = number[][];

// Hilfsfunktion: Überprüft ob eine Zahl an Position (row, col) gültig ist
function isValid(grid: SudokuGrid, row: number, col: number, num: number): boolean {
  // Prüfe Zeile
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }

  // Prüfe Spalte
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }

  // Prüfe 3x3 Block
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
}

// Hilfsfunktion: Füllt das Grid vollständig mit gültigen Zahlen
function fillGrid(grid: SudokuGrid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        // Zufällige Reihenfolge der Zahlen 1-9
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        
        for (const num of numbers) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            
            if (fillGrid(grid)) {
              return true;
            }
            
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Hilfsfunktion: Zählt die Anzahl der Lösungen (stoppt bei 2)
function countSolutions(grid: SudokuGrid, count = { value: 0 }): number {
  if (count.value > 1) return count.value;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            countSolutions(grid, count);
            grid[row][col] = 0;
            
            if (count.value > 1) return count.value;
          }
        }
        return count.value;
      }
    }
  }
  count.value++;
  return count.value;
}

// Hilfsfunktion: Prüft ob das Sudoku genau eine Lösung hat
function hasUniqueSolution(grid: SudokuGrid): boolean {
  const gridCopy = grid.map(row => [...row]);
  const count = countSolutions(gridCopy);
  return count === 1;
}

// Hilfsfunktion: Erstellt eine Kopie des Grids
function copyGrid(grid: SudokuGrid): SudokuGrid {
  return grid.map(row => [...row]);
}

// Hauptfunktion: Generiert ein Sudoku-Rätsel
export function generateSudoku(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): {
  puzzle: SudokuGrid;
  solution: SudokuGrid;
} {
  // Erstelle leeres Grid
  const solution: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(0));
  
  // Fülle das Grid vollständig
  fillGrid(solution);
  
  // Kopiere für das Puzzle
  const puzzle = copyGrid(solution);
  
  // Bestimme Anzahl der zu entfernenden Zahlen basierend auf Schwierigkeit
  const cellsToRemove = {
    easy: 40,
    medium: 50,
    hard: 60
  }[difficulty];
  
  // Erstelle Liste aller Zellenpositionen (nur obere linke Hälfte für Symmetrie)
  const positions: [number, number][] = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      // Nur Positionen hinzufügen, die nicht durch Symmetrie bereits abgedeckt sind
      if (i <= 4 || (i === 4 && j <= 4)) {
        positions.push([i, j]);
      }
    }
  }
  
  // Mische die Positionen
  positions.sort(() => Math.random() - 0.5);
  
  let removed = 0;
  
  // Entferne Zahlen mit doppelter Achsen-Symmetrie (horizontal + vertikal)
  for (const [row, col] of positions) {
    if (removed >= cellsToRemove) break;
    
    // Berechne symmetrische Positionen (horizontal und vertikal gespiegelt)
    const symRow = 8 - row;  // Horizontal gespiegelt
    const symCol = 8 - col;  // Vertikal gespiegelt
    
    // Erstelle Set aller betroffenen Positionen (ohne Duplikate)
    const affectedCells: [number, number][] = [];
    const cellSet = new Set<string>();
    
    // Füge alle 4 symmetrischen Positionen hinzu
    [[row, col], [symRow, col], [row, symCol], [symRow, symCol]].forEach(([r, c]) => {
      const key = `${r},${c}`;
      if (!cellSet.has(key)) {
        cellSet.add(key);
        affectedCells.push([r, c]);
      }
    });
    
    // Überspringe wenn bereits Zellen entfernt wurden
    if (affectedCells.some(([r, c]) => puzzle[r][c] === 0)) continue;
    
    // Speichere Werte aller betroffenen Zellen
    const savedValues = affectedCells.map(([r, c]) => puzzle[r][c]);
    
    // Entferne alle symmetrischen Zahlen
    affectedCells.forEach(([r, c]) => {
      puzzle[r][c] = 0;
    });
    
    // Prüfe ob Sudoku eindeutig lösbar bleibt
    if (!hasUniqueSolution(puzzle)) {
      // Stelle wieder her wenn nicht eindeutig
      affectedCells.forEach(([r, c], idx) => {
        puzzle[r][c] = savedValues[idx];
      });
    } else {
      // Zähle entfernte Zellen
      removed += affectedCells.length;
    }
  }
  
  return {
    puzzle,
    solution
  };
}

// Hilfsfunktion: Gibt das Grid als String aus (für Debugging)
export function gridToString(grid: SudokuGrid): string {
  let result = '';
  for (let i = 0; i < 9; i++) {
    if (i % 3 === 0 && i !== 0) result += '------+-------+------\n';
    for (let j = 0; j < 9; j++) {
      if (j % 3 === 0 && j !== 0) result += '| ';
      result += grid[i][j] === 0 ? '. ' : `${grid[i][j]} `;
    }
    result += '\n';
  }
  return result;
}
