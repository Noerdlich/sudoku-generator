import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import SudokuBoard from './components/SudokuBoard';
import MessageBox, { MessageType } from './components/MessageBox';
import StrategyGuide from './components/StrategyGuide';
import { generateSudoku, SudokuGrid, solveSudoku, isValidMove } from './utils/sudokuGenerator';
import { findLogicalNextMove } from './utils/sudokuSolver';
import { 
  createEmptyGrid, 
  createCombinedGrid, 
  isGridComplete, 
  isGridCorrect, 
  isSolutionEmpty 
} from './utils/gridHelpers';

// Helper: Validiert ein Grid mit isValidMove
const validateGrid = (grid: SudokuGrid): boolean => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const num = grid[i][j];
      if (num === 0) continue;
      
      const tempGrid = grid.map((r, ri) => 
        r.map((c, ci) => (ri === i && ci === j) ? 0 : c)
      );
      
      if (!isValidMove(tempGrid, i, j, num)) {
        return false;
      }
    }
  }
  return true;
};

function App() {
  // Initialisiere puzzle und solution zusammen aus demselben generierten Sudoku
  const initialGame = generateSudoku('medium');
  
  const [puzzle, setPuzzle] = useState<SudokuGrid>(initialGame.puzzle);
  const [solution, setSolution] = useState<SudokuGrid>(initialGame.solution);
  const [userGrid, setUserGrid] = useState<SudokuGrid>(createEmptyGrid);
  const [customPuzzle, setCustomPuzzle] = useState<SudokuGrid>(createEmptyGrid);
  
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showSolution, setShowSolution] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hintCooldown, setHintCooldown] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: MessageType } | null>(null);

  // Auto-hide message after 6 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Cooldown Timer für Tipp-Button
  useEffect(() => {
    if (hintCooldown > 0) {
      const timer = setTimeout(() => {
        setHintCooldown(hintCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hintCooldown]);

  // Automatische Überprüfung wenn Sudoku vollständig ist
  useEffect(() => {
    // Timer für Verzögerung (Debouncing)
    const timer = setTimeout(() => {
      const combinedGrid = createCombinedGrid(puzzle, userGrid);
      
      if (isGridComplete(combinedGrid)) {
        // Im Custom-Modus ohne Lösung: Nur Validierung
        if (customMode && isSolutionEmpty(solution)) {
          const isValid = validateGrid(combinedGrid);
          if (isValid) {
            setMessage({ 
              text: '✅ Alle Zahlen sind korrekt platziert! Das Sudoku ist gültig.', 
              type: 'success' 
            });
          } else {
            setShowErrors(true);
            setMessage({ 
              text: '❌ Es gibt noch Regelverstöße. Überprüfe die rot markierten Felder.', 
              type: 'error' 
            });
          }
        } else {
          // Normal-Modus oder Custom-Modus mit Lösung: Vergleiche mit solution
          if (isGridCorrect(combinedGrid, solution)) {
            setShowErrors(false);
            setMessage({ 
              text: '🎉 Herzlichen Glückwunsch! Du hast das Sudoku perfekt gelöst!', 
              type: 'success' 
            });
          } else {
            setShowErrors(true);
            setMessage({ 
              text: '❌ Fast geschafft! Einige Zahlen sind noch nicht korrekt.', 
              type: 'error' 
            });
          }
        }
      }
    }, 500); // Wartet 500ms nach letzter Eingabe
    
    // Cleanup: Löscht Timer wenn sich Abhängigkeiten ändern (User tippt weiter)
    return () => clearTimeout(timer);
  }, [puzzle, userGrid, solution, customMode]); // Läuft bei Änderung dieser Variablen

  const generateNewPuzzle = useCallback((diff: 'easy' | 'medium' | 'hard') => {
    setIsGenerating(true);
    setShowSolution(false);
    setHintCooldown(0);
    setShowErrors(false);
    
    // Kleine Verzögerung für bessere UX
    setTimeout(() => {
      const { puzzle: newPuzzle, solution: newSolution } = generateSudoku(diff);
      setPuzzle(newPuzzle);
      setSolution(newSolution);
      setUserGrid(createEmptyGrid());
      setDifficulty(diff);
      setIsGenerating(false);
    }, 100);
  }, []);

  const handleCellChange = useCallback((row: number, col: number, value: number) => {
    const hasNonEmptySolution = solution.some(r => r.some(c => c !== 0));
    
    if (customMode && !hasNonEmptySolution) {
      // Im Custom-Modus VOR dem Lösen: Ändere das custom puzzle
      setCustomPuzzle(prev => {
        const newGrid = prev.map(r => [...r]);
        newGrid[row][col] = value;
        return newGrid;
      });
      // Prüfe Validität in Echtzeit
      if (value !== 0) {
        const tempGrid = customPuzzle.map((r, i) => r.map((c, j) => (i === row && j === col) ? 0 : c));
        if (!isValidMove(tempGrid, row, col, value)) {
          setShowErrors(true);
        } else {
          setShowErrors(false);
        }
      } else {
        setShowErrors(false);
      }
    } else {
      // Normaler Modus ODER Custom-Modus NACH dem Lösen: Ändere userGrid
      setUserGrid(prev => {
        const newGrid = prev.map(r => [...r]);
        newGrid[row][col] = value;
        return newGrid;
      });
      // Setze Fehleranzeige zurück wenn Benutzer etwas ändert
      if (showErrors) {
        setShowErrors(false);
      }
    }
  }, [showErrors, customMode, customPuzzle, solution]);

  const handleReset = useCallback(() => {
    setUserGrid(createEmptyGrid());
    setShowSolution(false);
    setShowErrors(false);
  }, []);

  const toggleCustomMode = useCallback(() => {
    if (!customMode) {
      // Wechsel zu Custom-Modus
      setCustomMode(true);
      const emptyGrid = createEmptyGrid();
      setCustomPuzzle(emptyGrid);
      setUserGrid(emptyGrid);
      setPuzzle(emptyGrid);
      setSolution(emptyGrid);
      setShowErrors(false);
      setHintCooldown(0);
    } else {
      // Zurück zum normalen Modus
      setCustomMode(false);
      const newGame = generateSudoku(difficulty);
      setPuzzle(newGame.puzzle);
      setSolution(newGame.solution);
      setUserGrid(createEmptyGrid());
      setShowErrors(false);
      setHintCooldown(0);
    }
  }, [customMode, difficulty]);

  const solveCustomPuzzle = useCallback(() => {
    // Validiere das Custom-Sudoku vor dem Lösen
    if (!validateGrid(customPuzzle)) {
      setMessage({ text: 'Das Sudoku enthält Regelverstöße (z.B. doppelte Zahlen). Bitte korrigiere die Eingaben zuerst.', type: 'error' });
      return;
    }
    
    const result = solveSudoku(customPuzzle);
    if (result.solved) {
      setPuzzle(customPuzzle);
      setSolution(result.solution);
      setUserGrid(createEmptyGrid());
      setShowErrors(false);
      setMessage({ text: 'Sudoku erfolgreich gelöst! Du kannst jetzt mit Tipps spielen.', type: 'success' });
    } else {
      setMessage({ text: 'Dieses Sudoku hat keine gültige Lösung. Bitte überprüfe deine Eingaben.', type: 'error' });
    }
  }, [customPuzzle]);

  const showHint = useCallback(() => {
    // Erstelle temporäres Grid mit korrekten Werten (ignoriere falsche Benutzereingaben)
    const currentGrid: SudokuGrid = puzzle.map((row, i) => 
      row.map((cell, j) => {
        if (cell !== 0) return cell; // Vorgefertigte Zahlen
        if (userGrid[i][j] !== 0 && userGrid[i][j] === solution[i][j]) return userGrid[i][j]; // Korrekte Benutzereingaben
        return 0; // Leere oder falsche Felder
      })
    );
    
    // Prüfe ob es noch leere Zellen gibt
    const hasEmptyCells = currentGrid.some(row => row.some(cell => cell === 0));
    
    if (!hasEmptyCells) {
      setMessage({ text: 'Alle korrekten Felder sind bereits ausgefüllt! Überprüfe falsche Eingaben (rot markiert).', type: 'warning' });
      return;
    }
    
    // Verwende logische Solver-Strategien um den nächsten Schritt zu finden
    const hint = findLogicalNextMove(currentGrid);
    
    if (hint) {
      // Füge die gefundene Zahl ein
      setUserGrid(prev => {
        const newGrid = prev.map(r => [...r]);
        newGrid[hint.row][hint.col] = hint.value;
        return newGrid;
      });
      
      // Zeige die Strategie-Erklärung mit Link
      const difficultyEmoji = hint.difficulty === 'easy' ? '💡' : 
                             hint.difficulty === 'medium' ? '🧠' : '🎓';
      
      // Erstelle Link zur Strategie-Erklärung
      const strategyId = hint.strategy.toLowerCase().replace(/\s+/g, '-');
      const openStrategyLink = () => {
        const event = new CustomEvent('openStrategy', { 
          detail: { strategyId } 
        });
        window.dispatchEvent(event);
      };
      
      // Speichere die Funktion als Callback
      (window as any).openStrategyGuide = openStrategyLink;
      
      setMessage({ 
        text: `${difficultyEmoji} Tipp (${hint.strategy}): ${hint.explanation}`, 
        type: 'info' 
      });
    } else {
      // Fallback: Wenn keine logische Strategie gefunden wurde, zeige zufälligen korrekten Wert
      // (Dies sollte sehr selten passieren, nur bei sehr schweren Puzzles)
      const emptyCells: [number, number][] = [];
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (currentGrid[i][j] === 0) {
            emptyCells.push([i, j]);
          }
        }
      }
      
      if (emptyCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const [row, col] = emptyCells[randomIndex];
        const hintNumber = solution[row][col];
        
        setUserGrid(prev => {
          const newGrid = prev.map(r => [...r]);
          newGrid[row][col] = hintNumber;
          return newGrid;
        });
        
        setMessage({ 
          text: `💫 Tipp: ${hintNumber} in Zeile ${row + 1}, Spalte ${col + 1} (Fortgeschrittene Technik erforderlich)`, 
          type: 'info' 
        });
      }
    }
    
    // Starte Cooldown
    setHintCooldown(20);
  }, [puzzle, userGrid, solution]);

  const checkSolution = useCallback(() => {
    // Im Custom-Modus: Wenn noch keine Lösung vorhanden ist, prüfe nur Validität
    if (customMode && isSolutionEmpty(solution)) {
      const combinedGrid = createCombinedGrid(customPuzzle, userGrid);
      const hasErrors = !validateGrid(combinedGrid);
      const isComplete = isGridComplete(combinedGrid);
      
      if (hasErrors) {
        setShowErrors(true);
        setMessage({ text: 'Es gibt Regelverstöße! Die fehlerhaften Felder wurden rot markiert.', type: 'error' });
      } else if (isComplete) {
        setShowErrors(false);
        setMessage({ text: 'Alle Zahlen sind bisher korrekt eingetragen! Das Sudoku ist vollständig.', type: 'success' });
      } else {
        setShowErrors(false);
        setMessage({ text: 'Alle bisherigen Einträge sind korrekt! Das Sudoku ist noch nicht vollständig.', type: 'success' });
      }
      return;
    }

    // Normaler Modus oder Custom-Modus mit Lösung: Prüfe gegen Solution
    let correct = true;
    let complete = true;
    let hasErrors = false;
    
    const activePuzzle = customMode ? customPuzzle : puzzle;
    const combinedGrid = createCombinedGrid(activePuzzle, userGrid);
    
    // Prüfe auf Regelverstöße (wichtig für Custom Mode nach dem Lösen!)
    const hasRuleViolations = !validateGrid(combinedGrid);
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (activePuzzle[i][j] === 0) {
          if (userGrid[i][j] === 0) {
            complete = false;
          } else if (userGrid[i][j] !== solution[i][j]) {
            correct = false;
            hasErrors = true;
          }
        }
      }
    }
    
    // Wenn es Regelverstöße gibt, zeige diese als Fehler
    if (hasRuleViolations) {
      setShowErrors(true);
      setMessage({ text: 'Es gibt Regelverstöße (z.B. doppelte Zahlen in Zeile/Spalte/Block)! Die fehlerhaften Felder wurden rot markiert.', type: 'error' });
    } else if (complete && correct) {
      setShowErrors(false);
      setMessage({ text: 'Gratulation! Du hast das Sudoku richtig gelöst!', type: 'success' });
    } else if (hasErrors) {
      setShowErrors(true);
      if (complete) {
        setMessage({ text: 'Falsche Felder wurden rot markiert. Korrigiere sie und versuche es erneut.', type: 'error' });
      } else {
        setMessage({ text: 'Einige Felder sind falsch (rot markiert) und das Sudoku ist noch nicht vollständig.', type: 'warning' });
      }
    } else {
      setShowErrors(false);
      setMessage({ text: 'Alle bisherigen Einträge sind korrekt! Das Sudoku ist noch nicht vollständig.', type: 'success' });
    }
  }, [puzzle, userGrid, solution, customMode, customPuzzle]);

  return (
    <div className="App">
      <StrategyGuide />
      
      <header className="App-header">
        <h1>🎲 Sudoku Generator</h1>
        <p className="subtitle">Erstelle und löse symmetrische 9×9 Sudokus</p>
      </header>
      
      <main className="App-main">
        <div className="game-area">
          <div className="controls">
            <div className="mode-toggle">
              <button
                className={`btn ${!customMode ? 'active' : ''}`}
                onClick={() => !customMode ? null : toggleCustomMode()}
                disabled={isGenerating || !customMode}
              >
                Generiertes Sudoku
              </button>
              <button
                className={`btn ${customMode ? 'active' : ''}`}
                onClick={() => customMode ? null : toggleCustomMode()}
                disabled={isGenerating || customMode}
              >
                Eigenes Sudoku
              </button>
            </div>

          {!customMode && (
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
          )}

          {customMode && (
            <div className="custom-buttons">
              <button
                className="btn btn-primary"
                onClick={solveCustomPuzzle}
                disabled={isGenerating}
              >
                🧩 Sudoku lösen
              </button>
              <p className="custom-hint">Gib dein Sudoku ein und klicke auf "Sudoku lösen"</p>
            </div>
          )}
          
          {!customMode && (
            <div className="action-buttons">
              <button
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={isGenerating}
              >
                Zurücksetzen
              </button>
              <button
                className="btn btn-hint"
                onClick={showHint}
                disabled={isGenerating || hintCooldown > 0}
                title={hintCooldown > 0 ? `Warte noch ${hintCooldown} Sekunden` : 'Eine korrekte Zahl in ein zufälliges Feld einfügen'}
              >
                {hintCooldown > 0 ? `Tipp (${hintCooldown}s)` : '💡 Tipp anzeigen'}
              </button>
              <button
                className="btn btn-primary"
                onClick={checkSolution}
                disabled={isGenerating || showSolution}
              >
                Prüfen
              </button>
            </div>
          )}

          {(customMode && puzzle.some(row => row.some(cell => cell !== 0))) && (
            <div className="action-buttons">
              <button
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={isGenerating}
              >
                Zurücksetzen
              </button>
              <button
                className="btn btn-hint"
                onClick={showHint}
                disabled={isGenerating || hintCooldown > 0}
                title={hintCooldown > 0 ? `Warte noch ${hintCooldown} Sekunden` : 'Eine korrekte Zahl in ein zufälliges Feld einfügen'}
              >
                {hintCooldown > 0 ? `Tipp (${hintCooldown}s)` : '💡 Tipp anzeigen'}
              </button>
              <button
                className="btn btn-primary"
                onClick={checkSolution}
                disabled={isGenerating || showSolution}
              >
                Prüfen
              </button>
            </div>
          )}
        </div>
        
        <div className="board-container">
          {isGenerating ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Generiere neues Sudoku...</p>
            </div>
          ) : (
            <SudokuBoard
              puzzle={customMode ? customPuzzle : puzzle}
              solution={solution}
              userGrid={userGrid}
              onCellChange={handleCellChange}
              showSolution={showSolution}
              showErrors={showErrors}
              customMode={customMode}
            />
          )}
        </div>
        
          <div className="info">
            <p>
              {customMode ? (
                <><strong>Eigenes Sudoku:</strong> Gib deine Zahlen ein. Falsche Eingaben werden rot markiert. 
                Klicke auf "Sudoku lösen", um die Lösung zu berechnen und Tipps zu erhalten.</>
              ) : (
                <><strong>Hinweis:</strong> Graue Felder sind vorgegeben und können nicht geändert werden. 
                Blaue Zahlen sind deine Eingaben. Nutze den Tipp-Button (💡), um eine korrekte Zahl einzufügen (20s Cooldown).
                Falsche Felder werden rot markiert, wenn du auf "Prüfen" klickst.</>
              )}
            </p>
          </div>
        </div>
        
        <div className="message-area">
          {message && <MessageBox message={message.text} type={message.type} />}
        </div>
      </main>
      
      <footer className="App-footer">
        <p>Erstellt mit React und TypeScript | Alle Sudokus sind lösbar und symmetrisch</p>
      </footer>
    </div>
  );
}

export default App;
