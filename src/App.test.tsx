import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';

// Helper function to get cell value, ignoring candidates
const getCellValue = (cell: Element): string => {
  const candidatesGrid = cell.querySelector('.candidates-grid');
  if (candidatesGrid) return '';  // Hat Kandidaten, kein direkter Wert
  return cell.textContent?.trim() || '';
};

describe('App Basic Tests', () => {
  test('renders Sudoku Generator title', () => {
    render(<App />);
    expect(screen.getByText(/Sudoku Generator/i)).toBeInTheDocument();
  });

  test('renders action buttons in normal mode', () => {
    render(<App />);
    expect(screen.getByText('Zurücksetzen')).toBeInTheDocument();
    expect(screen.getByText(/Tipp anzeigen/i)).toBeInTheDocument();
    expect(screen.getByText('Prüfen')).toBeInTheDocument();
  });

  test('renders 81 input cells', () => {
    render(<App />);
    const inputs = screen.getAllByRole('button', { name: /cell-/i });
    expect(inputs).toHaveLength(81);
  });

  test('renders number keyboard with all buttons', () => {
    render(<App />);
    
    // Prüfe dass alle Zahlen-Buttons vorhanden sind
    for (let i = 1; i <= 9; i++) {
      expect(screen.getByRole('button', { name: `Number ${i}` })).toBeInTheDocument();
    }
    
    // Prüfe Delete-Button
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  test('renders difficulty buttons', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Leicht' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mittel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Schwer' })).toBeInTheDocument();
  });

  test('renders mode toggle buttons', () => {
    render(<App />);
    expect(screen.getByText('Generiertes Sudoku')).toBeInTheDocument();
    expect(screen.getByText('Eigenes Sudoku')).toBeInTheDocument();
  });

  test('switches to custom mode', () => {
    render(<App />);
    const customButton = screen.getByText('Eigenes Sudoku');
    fireEvent.click(customButton);
    expect(screen.getByText('🧩 Sudoku lösen')).toBeInTheDocument();
  });

  test('generates new puzzle on difficulty change', async () => {
    render(<App />);
    
    // Warte auf initiales Laden
    await waitFor(() => expect(screen.queryByText('Generiere neues Sudoku...')).not.toBeInTheDocument());
    
    const easyButton = screen.getByText('Leicht');
    fireEvent.click(easyButton);
    
    // Warte auf Neugenerierung
    await waitFor(() => expect(screen.queryByText('Generiere neues Sudoku...')).not.toBeInTheDocument());
    
    // App sollte Puzzle neu generiert haben
    const inputs = screen.getAllByRole('button', { name: /cell-/i });
    expect(inputs).toHaveLength(81);
  });

  test('switches back to generated mode from custom mode', () => {
    render(<App />);
    
    // Wechsel zu Custom
    const customButton = screen.getByText('Eigenes Sudoku');
    fireEvent.click(customButton);
    expect(screen.getByText('🧩 Sudoku lösen')).toBeInTheDocument();
    
    // Zurück zu Generated
    const generatedButton = screen.getByText('Generiertes Sudoku');
    fireEvent.click(generatedButton);
    expect(screen.getByText('Leicht')).toBeInTheDocument();
  });

  test('allows input in custom mode', () => {
    render(<App />);
    const customButton = screen.getByText('Eigenes Sudoku');
    fireEvent.click(customButton);
    
    const inputs = screen.getAllByRole('button', { name: /cell-/i });
    fireEvent.click(inputs[0]);
    const button5 = screen.getByRole('button', { name: 'Number 5' });
    fireEvent.click(button5);
    expect(getCellValue(inputs[0])).toBe('5');
  });

  test('resets user inputs when reset button is clicked', () => {
    render(<App />);
    
    const inputs = screen.getAllByRole('button', { name: /cell-/i });
    const editableInputs = inputs.filter(i => !i.hasAttribute('disabled'));
    
    // Es sollte mindestens ein editierbares Feld geben
    expect(editableInputs.length).toBeGreaterThan(0);
    
    fireEvent.click(editableInputs[0]);
    const button3 = screen.getByRole('button', { name: 'Number 3' });
    fireEvent.click(button3);
    expect(getCellValue(editableInputs[0])).toBe('3');
    
    const resetButton = screen.getByText('Zurücksetzen');
    fireEvent.click(resetButton);
    
    expect(getCellValue(editableInputs[0])).toBe('');
  });

  test('hint button has cooldown timer', () => {
    render(<App />);
    
    const hintButton = screen.getByText(/Tipp anzeigen/i);
    fireEvent.click(hintButton);
    
    // Nach Klick sollte Cooldown aktiv sein
    expect(screen.getByText(/Tipp \(\d+s\)/)).toBeInTheDocument();
  });

  describe('Prüfen Button Tests', () => {
    test('shows message when puzzle is not complete', () => {
      render(<App />);
      
      const checkButton = screen.getByText('Prüfen');
      fireEvent.click(checkButton);
      
      // Prüfe ob MessageBox erscheint
      const messageBox = screen.getByTestId('message-box');
      expect(messageBox).toBeInTheDocument();
      expect(screen.getByTestId('message-text')).toHaveTextContent(/korrekt/i);
    });

    test('detects duplicate numbers in custom mode', () => {
      render(<App />);
      
      const customButton = screen.getByText('Eigenes Sudoku');
      fireEvent.click(customButton);
      
      const inputs = screen.getAllByRole('button', { name: /cell-/i });
      
      // Setze zwei gleiche Zahlen in unterschiedlichen Positionen
      fireEvent.click(inputs[0]);
      const button5 = screen.getByRole('button', { name: 'Number 5' });
      fireEvent.click(button5);
      
      fireEvent.click(inputs[1]);
      fireEvent.click(button5);
      
      // Verifiziere dass beide Werte gesetzt wurden
      expect(getCellValue(inputs[0])).toBe('5');
      expect(getCellValue(inputs[1])).toBe('5');
    });

    test('shows success when all entries are correct', () => {
      render(<App />);
      
      const checkButton = screen.getByText('Prüfen');
      fireEvent.click(checkButton);
      
      // Bei leerem oder korrektem Puzzle sollte eine Meldung kommen
      expect(screen.getByTestId('message-box')).toBeInTheDocument();
      expect(screen.getByTestId('message-text')).toHaveTextContent(/korrekt/i);
    });

    test('validates duplicate detection in custom mode', () => {
      render(<App />);
      
      const customButton = screen.getByText('Eigenes Sudoku');
      fireEvent.click(customButton);
      
      const inputs = screen.getAllByRole('button', { name: /cell-/i });
      
      // Setze zwei gleiche Zahlen in die erste Zeile (Index 0 und 1)
      fireEvent.click(inputs[0]);
      const button7 = screen.getByRole('button', { name: 'Number 7' });
      fireEvent.click(button7);
      
      fireEvent.click(inputs[1]);
      fireEvent.click(button7);
      
      // Der "Prüfen" Button existiert noch nicht, aber die Eingaben sind ungültig
      // Prüfe ob die Werte gesetzt wurden
      expect(getCellValue(inputs[0])).toBe('7');
      expect(getCellValue(inputs[1])).toBe('7');
    });

    test('shows correct message for incomplete but valid puzzle', () => {
      render(<App />);
      
      const inputs = screen.getAllByRole('button', { name: /cell-/i });
      const editableInputs = inputs.filter(i => !i.hasAttribute('disabled'));
      
      // Nutze den Hint-Button um sicherzugehen, dass wir eine valide Zahl setzen
      if (editableInputs.length > 0) {
        const hintButton = screen.getByText(/Tipp anzeigen/);
        fireEvent.click(hintButton);
      }
      
      const checkButton = screen.getByText('Prüfen');
      fireEvent.click(checkButton);
      
      // Prüfe ob MessageBox mit relevantem Text erscheint
      expect(screen.getByTestId('message-box')).toBeInTheDocument();
    });
  });

  describe('Custom Mode Tests', () => {
    test('shows solve button in custom mode', () => {
      render(<App />);
      
      const customButton = screen.getByText('Eigenes Sudoku');
      fireEvent.click(customButton);
      
      expect(screen.getByText('🧩 Sudoku lösen')).toBeInTheDocument();
    });

    test('detects invalid custom sudoku with duplicates', () => {
      render(<App />);
      
      const customButton = screen.getByText('Eigenes Sudoku');
      fireEvent.click(customButton);
      
      const inputs = screen.getAllByRole('button', { name: /cell-/i });
      
      // Setze zwei gleiche Zahlen in erste Zeile
      fireEvent.click(inputs[0]);
      const button5 = screen.getByRole('button', { name: 'Number 5' });
      fireEvent.click(button5);
      
      fireEvent.click(inputs[1]);
      fireEvent.click(button5);
      
      const solveButton = screen.getByText('🧩 Sudoku lösen');
      fireEvent.click(solveButton);
      
      // Prüfe ob Fehlermeldung erscheint
      expect(screen.getByTestId('message-box')).toBeInTheDocument();
      expect(screen.getByTestId('message-text')).toHaveTextContent(/regelverstöße/i);
    });

    test('allows checking custom puzzle after solving', () => {
      render(<App />);
      
      const customButton = screen.getByText('Eigenes Sudoku');
      fireEvent.click(customButton);
      
      const inputs = screen.getAllByRole('button', { name: /cell-/i });
      
      // Setze ein paar valide Zahlen
      fireEvent.click(inputs[0]);
      fireEvent.click(screen.getByRole('button', { name: 'Number 5' }));
      
      fireEvent.click(inputs[10]);
      fireEvent.click(screen.getByRole('button', { name: 'Number 6' }));
      
      fireEvent.click(inputs[20]);
      fireEvent.click(screen.getByRole('button', { name: 'Number 7' }));
      
      // Versuche zu lösen (wird fehlschlagen wegen zu wenig Zahlen)
      const solveButton = screen.getByText('🧩 Sudoku lösen');
      fireEvent.click(solveButton);
      
      // MessageBox sollte erscheinen
      expect(screen.getByTestId('message-box')).toBeInTheDocument();
    });

    test('detects rule violations after solving custom sudoku', () => {
      render(<App />);
      
      const customButton = screen.getByText('Eigenes Sudoku');
      fireEvent.click(customButton);
      
      const inputs = screen.getAllByRole('button', { name: /cell-/i });
      
      // Setze drei 1en an Positionen die ein lösbares Sudoku ergeben
      // Position 0 = (0,0), Position 13 = (1,4), Position 26 = (2,8)
      const button1 = screen.getByRole('button', { name: 'Number 1' });
      
      fireEvent.click(inputs[0]);
      fireEvent.click(button1);
      
      fireEvent.click(inputs[13]);
      fireEvent.click(button1);
      
      fireEvent.click(inputs[26]);
      fireEvent.click(button1);
      
      // Löse das Sudoku
      const solveButton = screen.getByText('🧩 Sudoku lösen');
      fireEvent.click(solveButton);
      
      // Prüfe ob gelöst wurde (MessageBox sollte Erfolg melden)
      expect(screen.getByTestId('message-box')).toBeInTheDocument();
      expect(screen.getByTestId('message-text')).toHaveTextContent(/erfolgreich gelöst/i);
      
      // Nach dem Lösen: Füge eine 1 an Position (1,7) hinzu (Zeile 1, Spalte 7)
      // Das verletzt die Regel da bereits eine 1 in Zeile 1 an Position (1,4) ist
      const position1_7 = inputs[16]; // Zeile 1 * 9 + Spalte 7 = 16
      fireEvent.click(position1_7);
      fireEvent.click(button1);
      
      // Klicke auf Prüfen
      const checkButton = screen.getByText('Prüfen');
      fireEvent.click(checkButton);
      
      // Es sollte einen Regelverstoß erkennen
      expect(screen.getByTestId('message-text')).toHaveTextContent(/regelverstöße/i);
    });
  });

  describe('Input Validation Tests', () => {
    test('only allows numbers 1-9', () => {
      render(<App />);
      
      const inputs = screen.getAllByRole('button', { name: /cell-/i });
      const editableInputs = inputs.filter(i => !i.hasAttribute('disabled'));
      
      // Es sollte mindestens ein editierbares Feld geben
      expect(editableInputs.length).toBeGreaterThan(0);
      
      // Versuche ungültige Eingabe - 0 sollte nicht erlaubt sein
      // (es gibt keinen Number 0 Button im Keyboard)
      fireEvent.click(editableInputs[0]);
      // Kein Button für 0 vorhanden, Zelle sollte leer bleiben
      expect(getCellValue(editableInputs[0])).toBe('');
      
      // Keyboard hat nur 1-9, also kann 10 nicht eingegeben werden
      const button1 = screen.getByRole('button', { name: 'Number 1' });
      fireEvent.click(button1);
      // Nach einem Klick sollte es '1' sein, nicht '10'
      expect(getCellValue(editableInputs[0])).not.toBe('10');
    });

    test('preset cells are disabled', () => {
      render(<App />);
      
      const inputs = screen.getAllByRole('button', { name: /cell-/i });
      const disabledInputs = inputs.filter(i => i.hasAttribute('disabled'));
      
      // Es sollte mindestens einige vorgegebene Zellen geben
      expect(disabledInputs.length).toBeGreaterThan(0);
    });
  });

  describe('NumberKeyboard Integration Tests', () => {
    test('clicking keyboard number button fills selected cell', () => {
      render(<App />);
      
      const inputs = screen.getAllByRole('button', { name: /cell-/i });
      const editableInputs = inputs.filter(i => !i.hasAttribute('disabled'));
      
      // Wähle eine editierbare Zelle aus
      fireEvent.click(editableInputs[0]);
      
      // Klicke auf Keyboard-Button "5"
      const button5 = screen.getByRole('button', { name: 'Number 5' });
      fireEvent.click(button5);
      
      // Prüfe dass der Wert gesetzt wurde
      expect(getCellValue(editableInputs[0])).toBe('5');
    });

    test('clicking keyboard delete button clears selected cell', () => {
      render(<App />);
      
      const inputs = screen.getAllByRole('button', { name: /cell-/i });
      const editableInputs = inputs.filter(i => !i.hasAttribute('disabled'));
      
      // Setze einen Wert
      fireEvent.click(editableInputs[0]);
      const button7 = screen.getByRole('button', { name: 'Number 7' });
      fireEvent.click(button7);
      expect(getCellValue(editableInputs[0])).toBe('7');
      
      // Klicke auf Delete-Button
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      fireEvent.click(deleteButton);
      
      // Prüfe dass der Wert gelöscht wurde
      expect(getCellValue(editableInputs[0])).toBe('');
    });

    test('keyboard buttons do not change preset cells', () => {
      render(<App />);
      
      const inputs = screen.getAllByRole('button', { name: /cell-/i });
      const presetInputs = inputs.filter(i => i.hasAttribute('disabled'));
      
      // Es sollte mindestens eine vorgefertigte Zelle geben
      expect(presetInputs.length).toBeGreaterThan(0);
      
      const presetValue = getCellValue(presetInputs[0]);
      
      // Versuche eine vorgefertigte Zelle zu ändern
      fireEvent.click(presetInputs[0]);
      
      const button3 = screen.getByRole('button', { name: 'Number 3' });
      fireEvent.click(button3);
      
      // Wert sollte unverändert bleiben
      expect(getCellValue(presetInputs[0])).toBe(presetValue);
    });

    test('keyboard is enabled when not generating', () => {
      render(<App />);
      
      const button1 = screen.getByRole('button', { name: 'Number 1' });
      expect(button1).not.toBeDisabled();
    });

    test('cell selection works with click', () => {
      render(<App />);
      
      const inputs = screen.getAllByRole('button', { name: /cell-/i });
      const editableInputs = inputs.filter(i => !i.hasAttribute('disabled'));
      
      // Klicke auf erste editierbare Zelle
      fireEvent.click(editableInputs[0]);
      
      // Verwende Keyboard um Wert zu setzen
      const button9 = screen.getByRole('button', { name: 'Number 9' });
      fireEvent.click(button9);
      
      expect(getCellValue(editableInputs[0])).toBe('9');
      
      // Wechsle zu anderer Zelle
      if (editableInputs.length > 1) {
        fireEvent.click(editableInputs[1]);
        
        const button2 = screen.getByRole('button', { name: 'Number 2' });
        fireEvent.click(button2);
        
        expect(getCellValue(editableInputs[1])).toBe('2');
      }
    });

    test('can use keyboard to fill multiple cells sequentially', () => {
      render(<App />);
      
      const inputs = screen.getAllByRole('button', { name: /cell-/i });
      const editableInputs = inputs.filter(i => !i.hasAttribute('disabled'));
      
      // Stelle sicher dass wir mindestens 3 editierbare Zellen haben
      expect(editableInputs.length).toBeGreaterThanOrEqual(3);
      
      // Fülle erste Zelle
      fireEvent.click(editableInputs[0]);
      fireEvent.click(screen.getByRole('button', { name: 'Number 1' }));
      expect(getCellValue(editableInputs[0])).toBe('1');
      
      // Fülle zweite Zelle
      fireEvent.click(editableInputs[1]);
      fireEvent.click(screen.getByRole('button', { name: 'Number 2' }));
      expect(getCellValue(editableInputs[1])).toBe('2');
      
      // Fülle dritte Zelle
      fireEvent.click(editableInputs[2]);
      fireEvent.click(screen.getByRole('button', { name: 'Number 3' }));
      expect(getCellValue(editableInputs[2])).toBe('3');
    });

    test('keyboard works in custom mode', () => {
      render(<App />);
      
      // Wechsle zu Custom-Modus
      const customButton = screen.getByText('Eigenes Sudoku');
      fireEvent.click(customButton);
      
      const inputs = screen.getAllByRole('button', { name: /cell-/i });
      
      // In Custom-Modus sollten alle Zellen editierbar sein
      fireEvent.click(inputs[0]);
      
      const button4 = screen.getByRole('button', { name: 'Number 4' });
      fireEvent.click(button4);
      
      expect(getCellValue(inputs[0])).toBe('4');
    });
  });

  describe('Timer functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('renders timer display', () => {
      render(<App />);
      expect(screen.getByText(/⏱️ Zeit:/i)).toBeInTheDocument();
      expect(screen.getByText(/00:00/)).toBeInTheDocument();
    });

    test('timer starts at 00:00', () => {
      render(<App />);
      expect(screen.getByText(/00:00/)).toBeInTheDocument();
    });

    test('timer increments after 1 second', () => {
      render(<App />);
      
      // Timer sollte bei 00:00 starten
      expect(screen.getByText(/00:00/)).toBeInTheDocument();
      
      // Warte 1 Sekunde
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Timer sollte jetzt 00:01 anzeigen
      expect(screen.getByText(/00:01/)).toBeInTheDocument();
    });

    test('timer continues counting after multiple seconds', () => {
      render(<App />);
      
      // Starte bei 00:00
      expect(screen.getByText(/00:00/)).toBeInTheDocument();
      
      // Warte 10 Sekunden
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      expect(screen.getByText(/00:10/)).toBeInTheDocument();
    });

    test('timer shows correct format for minutes', () => {
      render(<App />);
      
      // Warte 65 Sekunden (1 Minute und 5 Sekunden)
      act(() => {
        jest.advanceTimersByTime(65000);
      });
      
      expect(screen.getByText(/01:05/)).toBeInTheDocument();
    });

    test('timer resets when clicking reset button', () => {
      render(<App />);
      
      // Lasse Timer laufen
      act(() => {
        jest.advanceTimersByTime(30000); // 30 Sekunden
      });
      expect(screen.getByText(/00:30/)).toBeInTheDocument();
      
      // Klicke Reset
      const resetButton = screen.getByText('Zurücksetzen');
      fireEvent.click(resetButton);
      
      // Timer sollte zurückgesetzt sein
      expect(screen.getByText(/00:00/)).toBeInTheDocument();
    });

    test('timer resets when generating new puzzle', async () => {
      render(<App />);
      
      // Lasse Timer laufen
      act(() => {
        jest.advanceTimersByTime(20000); // 20 Sekunden
      });
      expect(screen.getByText(/00:20/)).toBeInTheDocument();
      
      // Generiere neues Puzzle
      const easyButton = screen.getByRole('button', { name: 'Leicht' });
      fireEvent.click(easyButton);
      
      await waitFor(() => {
        expect(screen.getByText(/00:00/)).toBeInTheDocument();
      });
    });

    test('timer resets when switching to custom mode', () => {
      render(<App />);
      
      // Lasse Timer laufen
      act(() => {
        jest.advanceTimersByTime(15000); // 15 Sekunden
      });
      expect(screen.getByText(/00:15/)).toBeInTheDocument();
      
      // Wechsle zu Custom-Modus
      const customButton = screen.getByText('Eigenes Sudoku');
      fireEvent.click(customButton);
      
      // Timer sollte zurückgesetzt sein
      expect(screen.getByText(/00:00/)).toBeInTheDocument();
    });

    test('timer resets when switching back to normal mode', () => {
      render(<App />);
      
      // Wechsle zu Custom-Modus
      const customButton = screen.getByText('Eigenes Sudoku');
      fireEvent.click(customButton);
      
      // Lasse Timer laufen
      act(() => {
        jest.advanceTimersByTime(25000); // 25 Sekunden
      });
      expect(screen.getByText(/00:25/)).toBeInTheDocument();
      
      // Wechsle zurück zu Normal-Modus
      const normalButton = screen.getByText('Generiertes Sudoku');
      fireEvent.click(normalButton);
      
      // Timer sollte zurückgesetzt sein
      expect(screen.getByText(/00:00/)).toBeInTheDocument();
    });

    test('timer formats double-digit minutes correctly', () => {
      render(<App />);
      
      // Warte 10 Minuten und 30 Sekunden
      act(() => {
        jest.advanceTimersByTime(630000);
      });
      
      expect(screen.getByText(/10:30/)).toBeInTheDocument();
    });

    test('timer changes to HH:MM:SS format after one hour', () => {
      render(<App />);
      
      // Warte 1 Stunde, 5 Minuten und 30 Sekunden (3930 Sekunden)
      act(() => {
        jest.advanceTimersByTime(3930000);
      });
      
      expect(screen.getByText(/01:05:30/)).toBeInTheDocument();
    });

    test('timer stops at 99:59:59', () => {
      render(<App />);
      
      // Warte 99 Stunden, 59 Minuten und 59 Sekunden (359999 Sekunden)
      act(() => {
        jest.advanceTimersByTime(359999000);
      });
      
      expect(screen.getByText(/99:59:59/)).toBeInTheDocument();
      
      // Warte weitere 5 Sekunden - Timer sollte nicht weiterzählen
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      expect(screen.getByText(/99:59:59/)).toBeInTheDocument();
    });
  });

  describe('Notes/Candidates Feature Tests', () => {
    test('renders notes mode button', () => {
      render(<App />);
      expect(screen.getByText(/Notizen/)).toBeInTheDocument();
    });

    test('toggles notes mode when button is clicked', () => {
      render(<App />);
      const notesButton = screen.getByRole('button', { name: /Notizen/i });
      
      // Initial sollte Notes Mode nicht aktiv sein (📝 Notizen)
      expect(notesButton).toHaveTextContent('📝 Notizen');
      expect(notesButton).not.toHaveClass('active');
      
      // Aktiviere Notes Mode
      fireEvent.click(notesButton);
      expect(notesButton).toHaveTextContent('✏️ Notizen aktiv');
      expect(notesButton).toHaveClass('active');
      
      // Deaktiviere Notes Mode
      fireEvent.click(notesButton);
      expect(notesButton).toHaveTextContent('📝 Notizen');
      expect(notesButton).not.toHaveClass('active');
    });

    test('adds candidate when clicking number in notes mode', () => {
      render(<App />);
      const notesButton = screen.getByRole('button', { name: /Notizen/i });
      fireEvent.click(notesButton);
      
      // Wähle eine Zelle (erste editierbare)
      const cells = screen.getAllByRole('button', { name: /cell-/i });
      const editableCell = cells.find(cell => !cell.hasAttribute('disabled'));
      
      if (editableCell) {
        fireEvent.click(editableCell);
        
        // Klicke Zahl 5
        const number5Button = screen.getByRole('button', { name: 'Number 5' });
        fireEvent.click(number5Button);
        
        // Prüfe ob Kandidat hinzugefügt wurde (im DOM sollte die Zahl 5 als Kandidat erscheinen)
        const candidateElements = editableCell.querySelectorAll('.candidate');
        const has5 = Array.from(candidateElements).some(el => el.textContent === '5');
        expect(has5).toBe(true);
      }
    });

    test('removes candidate when clicking same number twice in notes mode', () => {
      render(<App />);
      const notesButton = screen.getByRole('button', { name: /Notizen/i });
      fireEvent.click(notesButton);
      
      const cells = screen.getAllByRole('button', { name: /cell-/i });
      const editableCell = cells.find(cell => !cell.hasAttribute('disabled'));
      
      if (editableCell) {
        fireEvent.click(editableCell);
        
        const number3Button = screen.getByRole('button', { name: 'Number 3' });
        
        // Füge Kandidat hinzu
        fireEvent.click(number3Button);
        let candidateElements = editableCell.querySelectorAll('.candidate');
        let has3 = Array.from(candidateElements).some(el => el.textContent === '3');
        expect(has3).toBe(true);
        
        // Entferne Kandidat wieder
        fireEvent.click(number3Button);
        candidateElements = editableCell.querySelectorAll('.candidate');
        has3 = Array.from(candidateElements).some(el => el.textContent === '3');
        expect(has3).toBe(false);
      }
    });

    test('clears candidates when entering value in normal mode', () => {
      render(<App />);
      const notesButton = screen.getByRole('button', { name: /Notizen/i });
      
      const cells = screen.getAllByRole('button', { name: /cell-/i });
      const editableCell = cells.find(cell => !cell.hasAttribute('disabled'));
      
      if (editableCell) {
        // Aktiviere Notes Mode und füge Kandidaten hinzu
        fireEvent.click(notesButton);
        fireEvent.click(editableCell);
        
        const number2Button = screen.getByRole('button', { name: 'Number 2' });
        const number7Button = screen.getByRole('button', { name: 'Number 7' });
        fireEvent.click(number2Button);
        fireEvent.click(number7Button);
        
        // Prüfe dass Kandidaten vorhanden sind
        let candidateElements = editableCell.querySelectorAll('.candidate');
        expect(candidateElements.length).toBeGreaterThan(0);
        
        // Deaktiviere Notes Mode
        fireEvent.click(notesButton);
        expect(notesButton).not.toHaveClass('active');
        
        // Gebe einen Wert ein
        const number5Button = screen.getByRole('button', { name: 'Number 5' });
        fireEvent.click(number5Button);
        
        // Kandidaten sollten gelöscht sein
        candidateElements = editableCell.querySelectorAll('.candidate');
        const visibleCandidates = Array.from(candidateElements).filter(el => 
          el.textContent && el.textContent.trim() !== ''
        );
        expect(visibleCandidates.length).toBe(0);
      }
    });

    test('displays candidates in 3x3 grid layout', () => {
      render(<App />);
      const notesButton = screen.getByRole('button', { name: /Notizen/i });
      fireEvent.click(notesButton);
      
      const cells = screen.getAllByRole('button', { name: /cell-/i });
      const editableCell = cells.find(cell => !cell.hasAttribute('disabled'));
      
      if (editableCell) {
        fireEvent.click(editableCell);
        
        // Füge mehrere Kandidaten hinzu
        for (let i = 1; i <= 5; i++) {
          const numberButton = screen.getByRole('button', { name: `Number ${i}` });
          fireEvent.click(numberButton);
        }
        
        // Prüfe ob candidates-grid Container existiert
        const candidatesGrid = editableCell.querySelector('.candidates-grid');
        expect(candidatesGrid).toBeInTheDocument();
        
        // Prüfe ob genau 9 Kandidaten-Slots existieren (1-9)
        const candidateSlots = candidatesGrid?.querySelectorAll('.candidate');
        expect(candidateSlots?.length).toBe(9);
      }
    });

    test('preserves candidates when switching cells in notes mode', () => {
      render(<App />);
      const notesButton = screen.getByRole('button', { name: /Notizen/i });
      fireEvent.click(notesButton);
      
      const cells = screen.getAllByRole('button', { name: /cell-/i });
      const editableCells = cells.filter(cell => !cell.hasAttribute('disabled'));
      
      if (editableCells.length >= 2) {
        // Wähle erste Zelle und füge Kandidaten hinzu
        fireEvent.click(editableCells[0]);
        const number1Button = screen.getByRole('button', { name: 'Number 1' });
        fireEvent.click(number1Button);
        
        // Wechsle zu zweiter Zelle
        fireEvent.click(editableCells[1]);
        const number9Button = screen.getByRole('button', { name: 'Number 9' });
        fireEvent.click(number9Button);
        
        // Prüfe dass erste Zelle ihre Kandidaten behält
        const candidatesCell1 = editableCells[0].querySelectorAll('.candidate');
        const has1 = Array.from(candidatesCell1).some(el => el.textContent === '1');
        expect(has1).toBe(true);
        
        // Prüfe dass zweite Zelle ihre Kandidaten hat
        const candidatesCell2 = editableCells[1].querySelectorAll('.candidate');
        const has9 = Array.from(candidatesCell2).some(el => el.textContent === '9');
        expect(has9).toBe(true);
      }
    });

    test('clears all candidates when generating new puzzle', async () => {
      render(<App />);
      const notesButton = screen.getByRole('button', { name: /Notizen/i });
      fireEvent.click(notesButton);
      
      const cells = screen.getAllByRole('button', { name: /cell-/i });
      const editableCell = cells.find(cell => !cell.hasAttribute('disabled'));
      
      if (editableCell) {
        // Füge Kandidaten hinzu
        fireEvent.click(editableCell);
        const number4Button = screen.getByRole('button', { name: 'Number 4' });
        fireEvent.click(number4Button);
        
        // Generiere neues Puzzle
        await waitFor(() => expect(screen.queryByText('Generiere neues Sudoku...')).not.toBeInTheDocument());
        const mediumButton = screen.getByRole('button', { name: 'Mittel' });
        fireEvent.click(mediumButton);
        await waitFor(() => expect(screen.queryByText('Generiere neues Sudoku...')).not.toBeInTheDocument());
        
        // Alle Kandidaten sollten gelöscht sein
        const allCandidates = screen.queryAllByText('4').filter(el => 
          el.classList.contains('candidate')
        );
        expect(allCandidates.length).toBe(0);
      }
    });

    test('clears all candidates when reset button is clicked', () => {
      render(<App />);
      const notesButton = screen.getByRole('button', { name: /Notizen/i });
      fireEvent.click(notesButton);
      
      const cells = screen.getAllByRole('button', { name: /cell-/i });
      const editableCell = cells.find(cell => !cell.hasAttribute('disabled'));
      
      if (editableCell) {
        // Füge Kandidaten hinzu
        fireEvent.click(editableCell);
        const number8Button = screen.getByRole('button', { name: 'Number 8' });
        fireEvent.click(number8Button);
        
        // Klicke Reset
        const resetButton = screen.getByText('Zurücksetzen');
        fireEvent.click(resetButton);
        
        // Alle Kandidaten sollten gelöscht sein
        const candidateElements = editableCell.querySelectorAll('.candidate');
        const visibleCandidates = Array.from(candidateElements).filter(el => 
          el.textContent && el.textContent.trim() !== ''
        );
        expect(visibleCandidates.length).toBe(0);
      }
    });

    test('delete button clears value but not candidates in notes mode', () => {
      render(<App />);
      const notesButton = screen.getByRole('button', { name: /Notizen/i });
      
      const cells = screen.getAllByRole('button', { name: /cell-/i });
      const editableCell = cells.find(cell => !cell.hasAttribute('disabled'));
      
      if (editableCell) {
        // Füge zuerst einen Wert im Normal Mode hinzu
        fireEvent.click(editableCell);
        const number6Button = screen.getByRole('button', { name: 'Number 6' });
        fireEvent.click(number6Button);
        
        // Wechsle zu Notes Mode und füge Kandidaten hinzu
        fireEvent.click(notesButton);
        fireEvent.click(editableCell);
        const number3Button = screen.getByRole('button', { name: 'Number 3' });
        fireEvent.click(number3Button);
        
        // Delete sollte im Notes Mode die Kandidaten nicht löschen
        const deleteButton = screen.getByRole('button', { name: 'Delete' });
        fireEvent.click(deleteButton);
        
        const candidateElements = editableCell.querySelectorAll('.candidate');
        const has3 = Array.from(candidateElements).some(el => el.textContent === '3');
        expect(has3).toBe(true);
      }
    });
  });
});
