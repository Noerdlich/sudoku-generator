import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import SudokuBoard from './components/SudokuBoard';
import NumberKeyboard from './components/NumberKeyboard';
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

// Helper: Erstellt leeres Kandidaten-Grid
const createEmptyCandidates = (): Set<number>[][] => {
  return Array(9).fill(null).map(() => 
    Array(9).fill(null).map(() => new Set<number>())
  );
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
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [notesMode, setNotesMode] = useState(false);
  const [candidates, setCandidates] = useState<Set<number>[][]>(createEmptyCandidates);

  // Helper function to show messages (ensures new messages always trigger)
  const showMessage = useCallback((text: string, type: MessageType) => {
    setMessage(null); // Reset first
    setTimeout(() => {
      setMessage({ text, type });
    }, 10);
  }, []);

  // Timer für Lösungszeit (max 99:59:59)
  useEffect(() => {
    if (isTimerRunning && elapsedTime < 359999) {
      const interval = setInterval(() => {
        setElapsedTime(prev => {
          if (prev >= 359999) {
            setIsTimerRunning(false);
            return 359999;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTimerRunning, elapsedTime]);

  // Formatiere Zeit in MM:SS oder HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-hide message after 20 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 20000);
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
            showMessage(
              '✅ Alle Zahlen sind korrekt platziert! Das Sudoku ist gültig.', 
              'success'
            );
          } else {
            setShowErrors(true);
            showMessage(
              '❌ Es gibt noch Regelverstöße. Überprüfe die rot markierten Felder.', 
              'error'
            );
          }
        } else {
          // Normal-Modus oder Custom-Modus mit Lösung: Vergleiche mit solution
          if (isGridCorrect(combinedGrid, solution)) {
            setShowErrors(false);
            setIsTimerRunning(false);
            showMessage(
              '🎉 Herzlichen Glückwunsch! Du hast das Sudoku perfekt gelöst!', 
              'success'
            );
          } else {
            setShowErrors(true);
            showMessage(
              '❌ Fast geschafft! Einige Zahlen sind noch nicht korrekt.', 
              'error'
            );
          }
        }
      }
    }, 500); // Wartet 500ms nach letzter Eingabe
    
    // Cleanup: Löscht Timer wenn sich Abhängigkeiten ändern (User tippt weiter)
    return () => clearTimeout(timer);
  }, [puzzle, userGrid, solution, customMode, showMessage]); // Läuft bei Änderung dieser Variablen

  const generateNewPuzzle = useCallback((diff: 'easy' | 'medium' | 'hard') => {
    setIsGenerating(true);
    setShowSolution(false);
    setHintCooldown(0);
    setShowErrors(false);
    setElapsedTime(0);
    setIsTimerRunning(true);
    setCandidates(createEmptyCandidates());
    
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
      // Normaler Modus ODER Custom-Modus NACH dem Lösen
      if (notesMode && value !== 0) {
        // Notizen-Modus: Kandidaten hinzufügen/entfernen (Toggle)
        setCandidates(prev => {
          const newCandidates = prev.map(r => r.map(c => new Set(c)));
          if (newCandidates[row][col].has(value)) {
            newCandidates[row][col].delete(value);
          } else {
            newCandidates[row][col].add(value);
          }
          return newCandidates;
        });
      } else if (notesMode && value === 0) {
        // Notizen-Modus + Delete: Lösche alle Kandidaten dieser Zelle
        setCandidates(prev => {
          const newCandidates = prev.map(r => r.map(c => new Set(c)));
          newCandidates[row][col].clear();
          return newCandidates;
        });
      } else {
        // Normal-Modus: Setze Zahl und lösche Kandidaten
        setUserGrid(prev => {
          const newGrid = prev.map(r => [...r]);
          newGrid[row][col] = value;
          return newGrid;
        });
        // Lösche Kandidaten für diese Zelle und entferne diese Zahl aus Zeile/Spalte/Block
        if (value !== 0) {
          setCandidates(prev => {
            const newCandidates = prev.map(r => r.map(c => new Set(c)));
            // Lösche Kandidaten der aktuellen Zelle
            newCandidates[row][col].clear();
            
            // Entferne diese Zahl aus allen Kandidaten in der Zeile
            for (let c = 0; c < 9; c++) {
              newCandidates[row][c].delete(value);
            }
            
            // Entferne diese Zahl aus allen Kandidaten in der Spalte
            for (let r = 0; r < 9; r++) {
              newCandidates[r][col].delete(value);
            }
            
            // Entferne diese Zahl aus allen Kandidaten im 3x3 Block
            const blockRow = Math.floor(row / 3) * 3;
            const blockCol = Math.floor(col / 3) * 3;
            for (let r = blockRow; r < blockRow + 3; r++) {
              for (let c = blockCol; c < blockCol + 3; c++) {
                newCandidates[r][c].delete(value);
              }
            }
            
            return newCandidates;
          });
        }
      }
      // Setze Fehleranzeige zurück wenn Benutzer etwas ändert
      if (showErrors) {
        setShowErrors(false);
      }
    }
  }, [showErrors, customMode, customPuzzle, solution, notesMode]);

  // Keyboard Event Listener für Computer-Tastatur
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignoriere wenn kein Feld ausgewählt ist
      if (!selectedCell) return;
      
      // Ignoriere wenn Eingabefeld fokussiert ist
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      
      const { row, col } = selectedCell;
      
      // Prüfe ob Zelle editierbar ist
      const currentPuzzle = customMode ? customPuzzle : puzzle;
      if (currentPuzzle[row][col] !== 0 && !customMode) return;
      
      // Zahlen 1-9
      if (event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        const num = parseInt(event.key, 10);
        handleCellChange(row, col, num);
      }
      // Backspace, Delete oder 0 für Löschen
      else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
        event.preventDefault();
        handleCellChange(row, col, 0);
      }
      // Pfeiltasten für Navigation
      else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        let newRow = row;
        let newCol = col;
        
        switch (event.key) {
          case 'ArrowUp':
            newRow = Math.max(0, row - 1);
            break;
          case 'ArrowDown':
            newRow = Math.min(8, row + 1);
            break;
          case 'ArrowLeft':
            newCol = Math.max(0, col - 1);
            break;
          case 'ArrowRight':
            newCol = Math.min(8, col + 1);
            break;
        }
        
        setSelectedCell({ row: newRow, col: newCol });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, customMode, customPuzzle, puzzle, handleCellChange]);

  const handleReset = useCallback(() => {
    setUserGrid(createEmptyGrid());
    setShowSolution(false);
    setShowErrors(false);
    setElapsedTime(0);
    setIsTimerRunning(true);
    setCandidates(createEmptyCandidates());
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
      setElapsedTime(0);
      setIsTimerRunning(true);
      setCandidates(createEmptyCandidates());
    } else {
      // Zurück zum normalen Modus
      setCustomMode(false);
      const newGame = generateSudoku(difficulty);
      setPuzzle(newGame.puzzle);
      setSolution(newGame.solution);
      setUserGrid(createEmptyGrid());
      setShowErrors(false);
      setHintCooldown(0);
      setElapsedTime(0);
      setIsTimerRunning(true);
      setCandidates(createEmptyCandidates());
    }
  }, [customMode, difficulty]);

  const solveCustomPuzzle = useCallback(() => {
    // Validiere das Custom-Sudoku vor dem Lösen
    if (!validateGrid(customPuzzle)) {
      showMessage('Das Sudoku enthält Regelverstöße (z.B. doppelte Zahlen). Bitte korrigiere die Eingaben zuerst.', 'error');
      return;
    }
    
    const result = solveSudoku(customPuzzle);
    if (result.solved) {
      setPuzzle(customPuzzle);
      setSolution(result.solution);
      setUserGrid(createEmptyGrid());
      setShowErrors(false);
      showMessage('Sudoku erfolgreich gelöst! Du kannst jetzt mit Tipps spielen.', 'success');
    } else {
      showMessage('Dieses Sudoku hat keine gültige Lösung. Bitte überprüfe deine Eingaben.', 'error');
    }
  }, [customPuzzle, showMessage]);

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
      showMessage('Alle korrekten Felder sind bereits ausgefüllt! Überprüfe falsche Eingaben (rot markiert).', 'warning');
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
      
      // Lösche Kandidaten für diese Zelle
      setCandidates(prev => {
        const newCandidates = prev.map(r => r.map(c => new Set(c)));
        newCandidates[hint.row][hint.col].clear();
        return newCandidates;
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
      
      showMessage(
        `${difficultyEmoji} Tipp (${hint.strategy}): ${hint.explanation}`, 
        'info'
      );
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
        
        showMessage(
          `💫 Tipp: ${hintNumber} in Zeile ${row + 1}, Spalte ${col + 1} (Fortgeschrittene Technik erforderlich)`, 
          'info'
        );
      }
    }
    
    // Starte Cooldown
    setHintCooldown(20);
  }, [puzzle, userGrid, solution, showMessage]);

  const handleCellSelect = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  const handleNumberClick = useCallback((num: number) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    // Im normalen Modus: Prüfe ob Zelle vorgegeben ist
    if (!customMode && puzzle[row][col] !== 0) {
      return; // Vorgefertigte Zellen können nicht geändert werden
    }
    
    // Im Custom-Modus vor dem Lösen: Alle Zellen editierbar
    // Im Custom-Modus nach dem Lösen: Nur nicht-vorgefertigte Zellen editierbar
    const hasNonEmptySolution = solution.some(r => r.some(c => c !== 0));
    if (customMode && hasNonEmptySolution && puzzle[row][col] !== 0) {
      return; // Nach dem Lösen: Vorgefertigte Zellen nicht änderbar
    }
    
    handleCellChange(row, col, num);
  }, [selectedCell, customMode, puzzle, solution, handleCellChange]);

  const handleDelete = useCallback(() => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    // Im normalen Modus: Prüfe ob Zelle vorgegeben ist
    if (!customMode && puzzle[row][col] !== 0) {
      return; // Vorgefertigte Zellen können nicht gelöscht werden
    }
    
    // Im Custom-Modus nach dem Lösen: Prüfe ob Zelle vorgegeben ist
    const hasNonEmptySolution = solution.some(r => r.some(c => c !== 0));
    if (customMode && hasNonEmptySolution && puzzle[row][col] !== 0) {
      return; // Nach dem Lösen: Vorgefertigte Zellen nicht löschbar
    }
    
    handleCellChange(row, col, 0);
  }, [selectedCell, customMode, puzzle, solution, handleCellChange]);

  const checkSolution = useCallback(() => {
    // Im Custom-Modus: Wenn noch keine Lösung vorhanden ist, prüfe nur Validität
    if (customMode && isSolutionEmpty(solution)) {
      const combinedGrid = createCombinedGrid(customPuzzle, userGrid);
      const hasErrors = !validateGrid(combinedGrid);
      const isComplete = isGridComplete(combinedGrid);
      
      if (hasErrors) {
        setShowErrors(true);
        showMessage('Es gibt Regelverstöße! Die fehlerhaften Felder wurden rot markiert.', 'error');
      } else if (isComplete) {
        setShowErrors(false);
        showMessage('Alle Zahlen sind bisher korrekt eingetragen! Das Sudoku ist vollständig.', 'success');
      } else {
        setShowErrors(false);
        showMessage('Alle bisherigen Einträge sind korrekt! Das Sudoku ist noch nicht vollständig.', 'success');
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
      showMessage('Es gibt Regelverstöße (z.B. doppelte Zahlen in Zeile/Spalte/Block)! Die fehlerhaften Felder wurden rot markiert.', 'error');
    } else if (complete && correct) {
      setShowErrors(false);
      showMessage('Gratulation! Du hast das Sudoku richtig gelöst!', 'success');
    } else if (hasErrors) {
      setShowErrors(true);
      if (complete) {
        showMessage('Falsche Felder wurden rot markiert. Korrigiere sie und versuche es erneut.', 'error');
      } else {
        showMessage('Einige Felder sind falsch (rot markiert) und das Sudoku ist noch nicht vollständig.', 'warning');
      }
    } else {
      setShowErrors(false);
      showMessage('Alle bisherigen Einträge sind korrekt! Das Sudoku ist noch nicht vollständig.', 'success');
    }
  }, [puzzle, userGrid, solution, customMode, customPuzzle, showMessage]);

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
        
        <div className="timer-display">
          ⏱️ Zeit: {formatTime(elapsedTime)}
        </div>
        
        <div className="board-container">
          {isGenerating ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Generiere neues Sudoku...</p>
            </div>
          ) : (
            <>
              <SudokuBoard
                puzzle={customMode ? customPuzzle : puzzle}
                solution={solution}
                userGrid={userGrid}
                onCellChange={handleCellChange}
                showSolution={showSolution}
                showErrors={showErrors}
                customMode={customMode}
                selectedCell={selectedCell}
                onCellSelect={handleCellSelect}
                candidates={candidates}
                notesMode={notesMode}
              />
              
              <div className="notes-toggle-slider">
                <label className="toggle-label">
                  <span className="toggle-text">Notizen-Modus</span>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notesMode}
                      onChange={() => setNotesMode(!notesMode)}
                      disabled={isGenerating || showSolution || customMode}
                    />
                    <span className="slider"></span>
                  </div>
                </label>
              </div>
              
              <NumberKeyboard
                onNumberClick={handleNumberClick}
                onDelete={handleDelete}
                disabled={isGenerating}
              />
            </>
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
