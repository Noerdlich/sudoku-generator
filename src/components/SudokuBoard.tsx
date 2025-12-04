import React from 'react';
import './SudokuBoard.css';
import { SudokuGrid } from '../utils/sudokuGenerator';
import { createCombinedGrid, hasConflict } from '../utils/gridHelpers';

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
    
    const combinedGrid = createCombinedGrid(puzzle, userGrid);
    const num = combinedGrid[row][col];
    if (num === 0) return false;
    
    // Prüfe auf Regelverstöße (Duplikate in Zeile/Spalte/Block)
    if (hasConflict(combinedGrid, row, col, num)) {
      return true;
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
              aria-label={`Sudoku cell row ${row + 1} column ${col + 1}`}
              title={`Enter number for row ${row + 1}, column ${col + 1}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SudokuBoard;
