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
  selectedCell: { row: number; col: number } | null;
  onCellSelect: (row: number, col: number) => void;
  candidates: Set<number>[][];
  notesMode: boolean;
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  puzzle,
  solution,
  userGrid,
  onCellChange,
  showSolution,
  showErrors,
  customMode = false,
  selectedCell,
  onCellSelect,
  candidates,
  notesMode
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
    
    // Hervorhebung für ausgewählte Zelle
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      classes.push('selected');
    }
    
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

  const renderCellContent = (row: number, col: number) => {
    const cellValue = displayValue(row, col);
    const cellCandidates = candidates[row][col];
    
    // Wenn eine normale Zahl vorhanden ist, zeige diese
    if (cellValue) {
      return cellValue;
    }
    
    // Wenn Kandidaten vorhanden sind, zeige diese im 3x3 Grid
    if (cellCandidates.size > 0) {
      return (
        <div className="candidates-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <span 
              key={num} 
              className={`candidate ${cellCandidates.has(num) ? 'visible' : ''}`}
            >
              {cellCandidates.has(num) ? num : ''}
            </span>
          ))}
        </div>
      );
    }
    
    return '';
  };

  return (
    <div className="sudoku-board">
      {Array.from({ length: 9 }, (_, row) => (
        <div key={row} className="row">
          {Array.from({ length: 9 }, (_, col) => (
            <button
              key={`${row}-${col}`}
              className={getCellClassName(row, col)}
              onClick={() => onCellSelect(row, col)}
              disabled={puzzle[row][col] !== 0}
              aria-label={`cell-${row}-${col}`}
              title={`Enter number for row ${row + 1}, column ${col + 1}`}
              type="button"
            >
              {renderCellContent(row, col)}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SudokuBoard;
