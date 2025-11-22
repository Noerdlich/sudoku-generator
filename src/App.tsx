import React, { useState, useCallback } from 'react';
import './App.css';
import SudokuBoard from './components/SudokuBoard';
import { generateSudoku, SudokuGrid } from './utils/sudokuGenerator';

function App() {
  const [puzzle, setPuzzle] = useState<SudokuGrid>(() => {
    const { puzzle } = generateSudoku('medium');
    return puzzle;
  });
  
  const [solution, setSolution] = useState<SudokuGrid>(() => {
    const { solution } = generateSudoku('medium');
    return solution;
  });
  
  const [userGrid, setUserGrid] = useState<SudokuGrid>(() =>
    Array(9).fill(null).map(() => Array(9).fill(0))
  );
  
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showSolution, setShowSolution] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNewPuzzle = useCallback((diff: 'easy' | 'medium' | 'hard') => {
    setIsGenerating(true);
    setShowSolution(false);
    
    // Kleine Verzögerung für bessere UX
    setTimeout(() => {
      const { puzzle: newPuzzle, solution: newSolution } = generateSudoku(diff);
      setPuzzle(newPuzzle);
      setSolution(newSolution);
      setUserGrid(Array(9).fill(null).map(() => Array(9).fill(0)));
      setDifficulty(diff);
      setIsGenerating(false);
    }, 100);
  }, []);

  const handleCellChange = useCallback((row: number, col: number, value: number) => {
    setUserGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      newGrid[row][col] = value;
      return newGrid;
    });
  }, []);

  const handleReset = useCallback(() => {
    setUserGrid(Array(9).fill(null).map(() => Array(9).fill(0)));
    setShowSolution(false);
  }, []);

  const toggleSolution = useCallback(() => {
    setShowSolution(prev => !prev);
  }, []);

  const checkSolution = useCallback(() => {
    let correct = true;
    let complete = true;
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (puzzle[i][j] === 0) {
          if (userGrid[i][j] === 0) {
            complete = false;
          } else if (userGrid[i][j] !== solution[i][j]) {
            correct = false;
          }
        }
      }
    }
    
    if (complete && correct) {
      alert('🎉 Gratulation! Du hast das Sudoku richtig gelöst!');
    } else if (complete && !correct) {
      alert('❌ Leider nicht korrekt. Überprüfe deine Eingaben.');
    } else {
      alert('⚠️ Das Sudoku ist noch nicht vollständig ausgefüllt.');
    }
  }, [puzzle, userGrid, solution]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎲 Sudoku Generator</h1>
        <p className="subtitle">Erstelle und löse symmetrische 9×9 Sudokus</p>
      </header>
      
      <main className="App-main">
        <div className="controls">
          <div className="difficulty-buttons">
            <button
              className={`btn ${difficulty === 'easy' ? 'active' : ''}`}
              onClick={() => generateNewPuzzle('easy')}
              disabled={isGenerating}
            >
              Leicht
            </button>
            <button
              className={`btn ${difficulty === 'medium' ? 'active' : ''}`}
              onClick={() => generateNewPuzzle('medium')}
              disabled={isGenerating}
            >
              Mittel
            </button>
            <button
              className={`btn ${difficulty === 'hard' ? 'active' : ''}`}
              onClick={() => generateNewPuzzle('hard')}
              disabled={isGenerating}
            >
              Schwer
            </button>
          </div>
          
          <div className="action-buttons">
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={isGenerating}
            >
              Zurücksetzen
            </button>
            <button
              className="btn btn-secondary"
              onClick={toggleSolution}
              disabled={isGenerating}
            >
              {showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
            </button>
            <button
              className="btn btn-primary"
              onClick={checkSolution}
              disabled={isGenerating || showSolution}
            >
              Prüfen
            </button>
          </div>
        </div>
        
        <div className="board-container">
          {isGenerating ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Generiere neues Sudoku...</p>
            </div>
          ) : (
            <SudokuBoard
              puzzle={puzzle}
              solution={solution}
              userGrid={userGrid}
              onCellChange={handleCellChange}
              showSolution={showSolution}
            />
          )}
        </div>
        
        <div className="info">
          <p>
            <strong>Hinweis:</strong> Graue Felder sind vorgegeben und können nicht geändert werden. 
            Blaue Zahlen sind deine Eingaben. Klicke auf "Prüfen", um deine Lösung zu überprüfen.
          </p>
        </div>
      </main>
      
      <footer className="App-footer">
        <p>Erstellt mit React und TypeScript | Alle Sudokus sind lösbar und symmetrisch</p>
      </footer>
    </div>
  );
}

export default App;
