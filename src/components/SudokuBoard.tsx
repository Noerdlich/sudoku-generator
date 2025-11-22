import React from 'react';
import './SudokuBoard.css';
import { SudokuGrid } from '../utils/sudokuGenerator';

interface SudokuBoardProps {
  puzzle: SudokuGrid;
  solution: SudokuGrid;
  userGrid: SudokuGrid;
  onCellChange: (row: number, col: number, value: number) => void;
  showSolution: boolean;
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  puzzle,
  solution,
  userGrid,
  onCellChange,
  showSolution
}) => {
  const handleInputChange = (row: number, col: number, value: string) => {
    const num = value === '' ? 0 : parseInt(value, 10);
    if (value === '' || (num >= 1 && num <= 9)) {
      onCellChange(row, col, num);
    }
  };

  const getCellClassName = (row: number, col: number): string => {
    const classes = ['cell'];
    
    // Hervorhebung der 3x3 Blöcke
    if (col % 3 === 2 && col !== 8) classes.push('right-border');
    if (row % 3 === 2 && row !== 8) classes.push('bottom-border');
    
    // Vorgefertigte Zellen (nicht editierbar)
    if (puzzle[row][col] !== 0) {
      classes.push('preset');
    } else if (userGrid[row][col] !== 0) {
      // Benutzereingaben werden normal angezeigt (kein direktes Feedback)
      classes.push('user-input');
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
              disabled={puzzle[row][col] !== 0 || showSolution}
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
