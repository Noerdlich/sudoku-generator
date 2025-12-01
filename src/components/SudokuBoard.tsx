import React from 'react';
import './SudokuBoard.css';
import { SudokuGrid } from '../utils/sudokuGenerator';

interface SudokuBoardProps {
  puzzle: SudokuGrid;
  solution: SudokuGrid;
  userGrid: SudokuGrid;
  onCellChange: (row: number, col: number, value: number) => void;
  showSolution: boolean;
  showErrors: boolean;
  customMode?: boolean;
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  puzzle,
  solution,
  userGrid,
  onCellChange,
  showSolution,
  showErrors,
  customMode = false
}) => {
  const handleInputChange = (row: number, col: number, value: string) => {
    const num = value === '' ? 0 : parseInt(value, 10);
    if (value === '' || (num >= 1 && num <= 9)) {
      onCellChange(row, col, num);
    }
  };

  const isInvalidCell = (row: number, col: number): boolean => {
    if (!showErrors) return false;
    
    // Erstelle kombiniertes Grid (Puzzle + User-Eingaben)
    const combinedGrid: SudokuGrid = puzzle.map((r, i) =>
      r.map((c, j) => c !== 0 ? c : userGrid[i][j])
    );
    
    const num = combinedGrid[row][col];
    if (num === 0) return false;
    
    // Prüfe auf Regelverstöße (Duplikate in Zeile/Spalte/Block)
    // Prüfe Zeile
    for (let c = 0; c < 9; c++) {
      if (c !== col && combinedGrid[row][c] === num) return true;
    }
    
    // Prüfe Spalte
    for (let r = 0; r < 9; r++) {
      if (r !== row && combinedGrid[r][col] === num) return true;
    }
    
    // Prüfe 3x3 Block
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if ((r !== row || c !== col) && combinedGrid[r][c] === num) return true;
      }
    }
    
    // Zusätzlich: Wenn eine Lösung vorhanden ist, prüfe auch gegen diese
    const hasNonEmptySolution = solution.some(r => r.some(c => c !== 0));
    if (hasNonEmptySolution && userGrid[row][col] !== 0 && userGrid[row][col] !== solution[row][col]) {
      return true;
    }
    
    return false;
  };

  const getCellClassName = (row: number, col: number): string => {
    const classes = ['cell'];
    
    // Hervorhebung der 3x3 Blöcke
    if (col % 3 === 2 && col !== 8) classes.push('right-border');
    if (row % 3 === 2 && row !== 8) classes.push('bottom-border');
    
    // Vorgefertigte Zellen (nicht editierbar)
    if (puzzle[row][col] !== 0) {
      classes.push('preset');
      if (isInvalidCell(row, col)) {
        classes.push('error');
      }
    } else if (userGrid[row][col] !== 0) {
      // Prüfe ob Fehler angezeigt werden sollen
      if (isInvalidCell(row, col)) {
        classes.push('error');
      } else {
        // Benutzereingaben werden normal angezeigt
        classes.push('user-input');
      }
    }
    
    return classes.join(' ');
  };

  const displayValue = (row: number, col: number): string => {
    if (showSolution) {
      return solution[row][col].toString();
    }
    
    if (puzzle[row][col] !== 0) {
      return puzzle[row][col].toString();
    }
    
    if (userGrid[row][col] !== 0) {
      return userGrid[row][col].toString();
    }
    
    return '';
  };

  return (
    <div className="sudoku-board">
      {Array.from({ length: 9 }, (_, row) => (
        <div key={row} className="row">
          {Array.from({ length: 9 }, (_, col) => (
            <input
              key={`${row}-${col}`}
              type="text"
              className={getCellClassName(row, col)}
              value={displayValue(row, col)}
              onChange={(e) => handleInputChange(row, col, e.target.value)}
              disabled={(!customMode && puzzle[row][col] !== 0) || showSolution}
              maxLength={1}
              inputMode="numeric"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SudokuBoard;
