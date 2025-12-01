import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import SudokuBoard from './components/SudokuBoard';
import { generateSudoku, SudokuGrid, solveSudoku, isValidMove } from './utils/sudokuGenerator';

// Helper: Erstellt leeres 9x9 Grid
const createEmptyGrid = (): SudokuGrid => Array(9).fill(null).map(() => Array(9).fill(0));

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

  // Cooldown Timer für Tipp-Button
  useEffect(() => {
    if (hintCooldown > 0) {
      const timer = setTimeout(() => {
        setHintCooldown(hintCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hintCooldown]);

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
    if (customMode) {
      // Im Custom-Modus: Ändere das custom puzzle
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
      // Normaler Modus: Ändere userGrid
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
  }, [showErrors, customMode, customPuzzle]);

  const handleReset = useCallback(() => {
    setUserGrid(createEmptyGrid());
    setShowSolution(false);
    setShowErrors(false);
  }, []);

  const toggleCustomMode = useCallback(() => {
    if (!customMode) {
      // Wechsel zu Custom-Modus
      setCustomMode(true);
      setCustomPuzzle(createEmptyGrid());
      setUserGrid(createEmptyGrid());
      setPuzzle(createEmptyGrid());
      setSolution(createEmptyGrid());
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
      alert('❌ Das Sudoku enthält Regelverstöße (z.B. doppelte Zahlen). Bitte korrigiere die Eingaben zuerst.');
      return;
    }
    
    const result = solveSudoku(customPuzzle);
    if (result.solved) {
      setPuzzle(customPuzzle);
      setSolution(result.solution);
      setUserGrid(createEmptyGrid());
      setShowErrors(false);
      alert('✅ Sudoku erfolgreich gelöst! Du kannst jetzt mit Tipps spielen.');
    } else {
      alert('❌ Dieses Sudoku hat keine gültige Lösung. Bitte überprüfe deine Eingaben.');
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
    
    // Finde alle leeren Zellen die noch korrekt ausgefüllt werden müssen
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (currentGrid[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    if (emptyCells.length === 0) {
      alert('⚠️ Alle korrekten Felder sind bereits ausgefüllt! Überprüfe falsche Eingaben (rot markiert).');
      return;
    }
    
    // Wähle eine zufällige leere Zelle
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const [row, col] = emptyCells[randomIndex];
    const hintNumber = solution[row][col];
    
    // Erstelle Erklärung
    const rowLabel = row + 1;
    const colLabel = col + 1;
    const blockRow = Math.floor(row / 3) + 1;
    const blockCol = Math.floor(col / 3) + 1;
    
    // Prüfe Konflikte in Zeile, Spalte und Block
    const reasons: string[] = [];
    
    // Prüfe Zeile
    const rowNumbers = new Set<number>();
    for (let c = 0; c < 9; c++) {
      if (currentGrid[row][c] !== 0 && c !== col) rowNumbers.add(currentGrid[row][c]);
    }
    
    // Prüfe Spalte
    const colNumbers = new Set<number>();
    for (let r = 0; r < 9; r++) {
      if (currentGrid[r][col] !== 0 && r !== row) colNumbers.add(currentGrid[r][col]);
    }
    
    // Prüfe 3x3 Block
    const blockNumbers = new Set<number>();
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (currentGrid[r][c] !== 0 && (r !== row || c !== col)) {
          blockNumbers.add(currentGrid[r][c]);
        }
      }
    }
    
    // Erstelle Erklärung basierend auf Ausschlussverfahren
    const missingInRow: number[] = [];
    const missingInCol: number[] = [];
    const missingInBlock: number[] = [];
    
    for (let n = 1; n <= 9; n++) {
      if (!rowNumbers.has(n)) missingInRow.push(n);
      if (!colNumbers.has(n)) missingInCol.push(n);
      if (!blockNumbers.has(n)) missingInBlock.push(n);
    }
    
    if (missingInRow.length === 1 || missingInCol.length === 1 || missingInBlock.length === 1) {
      if (missingInRow.length === 1) {
        reasons.push(`Letzte fehlende Zahl in Zeile ${rowLabel}`);
      } else if (missingInCol.length === 1) {
        reasons.push(`Letzte fehlende Zahl in Spalte ${colLabel}`);
      } else if (missingInBlock.length === 1) {
        reasons.push(`Letzte fehlende Zahl in Block ${blockRow}×${blockCol}`);
      }
    } else {
      reasons.push(`Einzige mögliche Zahl für Zeile ${rowLabel}, Spalte ${colLabel}`);
    }
    
    // Füge die korrekte Zahl ein
    setUserGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      newGrid[row][col] = hintNumber;
      return newGrid;
    });
    
    // Zeige Erklärung
    alert(`💡 Tipp: ${hintNumber} an Position (Zeile ${rowLabel}, Spalte ${colLabel})\n\n${reasons[0]}`);
    
    // Starte Cooldown
    setHintCooldown(20);
  }, [puzzle, userGrid, solution]);

  const checkSolution = useCallback(() => {
    // Im Custom-Modus: Wenn noch keine Lösung vorhanden ist, prüfe nur Validität
    if (customMode && solution.every(row => row.every(cell => cell === 0))) {
      // Erstelle ein kombiniertes Grid aus customPuzzle und userGrid
      const combinedGrid: SudokuGrid = customPuzzle.map((row, i) =>
        row.map((cell, j) => cell !== 0 ? cell : userGrid[i][j])
      );
      
      const hasErrors = !validateGrid(combinedGrid);
      const isComplete = combinedGrid.every(row => row.every(cell => cell !== 0));
      
      if (hasErrors) {
        setShowErrors(true);
        alert('❌ Es gibt Regelverstöße! Die fehlerhaften Felder wurden rot markiert.');
      } else if (isComplete) {
        setShowErrors(false);
        alert('✅ Alle Zahlen sind bisher korrekt eingetragen! Das Sudoku ist vollständig.');
      } else {
        setShowErrors(false);
        alert('✅ Alle bisherigen Einträge sind korrekt! Das Sudoku ist noch nicht vollständig.');
      }
      return;
    }

    // Normaler Modus oder Custom-Modus mit Lösung: Prüfe gegen Solution
    let correct = true;
    let complete = true;
    let hasErrors = false;
    
    const activePuzzle = customMode ? customPuzzle : puzzle;
    
    // Erstelle kombiniertes Grid für Validierung
    const combinedGrid: SudokuGrid = activePuzzle.map((row, i) =>
      row.map((cell, j) => cell !== 0 ? cell : userGrid[i][j])
    );
    
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
      alert('❌ Es gibt Regelverstöße (z.B. doppelte Zahlen in Zeile/Spalte/Block)! Die fehlerhaften Felder wurden rot markiert.');
    } else if (complete && correct) {
      setShowErrors(false);
      alert('🎉 Gratulation! Du hast das Sudoku richtig gelöst!');
    } else if (hasErrors) {
      setShowErrors(true);
      if (complete) {
        alert('❌ Falsche Felder wurden rot markiert. Korrigiere sie und versuche es erneut.');
      } else {
        alert('⚠️ Einige Felder sind falsch (rot markiert) und das Sudoku ist noch nicht vollständig.');
      }
    } else {
      setShowErrors(false);
      alert('✅ Alle bisherigen Einträge sind korrekt! Das Sudoku ist noch nicht vollständig.');
    }
  }, [puzzle, userGrid, solution, customMode, customPuzzle]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎲 Sudoku Generator</h1>
        <p className="subtitle">Erstelle und löse symmetrische 9×9 Sudokus</p>
      </header>
      
      <main className="App-main">
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
      </main>
      
      <footer className="App-footer">
        <p>Erstellt mit React und TypeScript | Alle Sudokus sind lösbar und symmetrisch</p>
      </footer>
    </div>
  );
}

export default App;
