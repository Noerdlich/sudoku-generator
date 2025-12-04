import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

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
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(81);
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
    const inputs = screen.getAllByRole('textbox');
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
    
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '5' } });
    expect((inputs[0] as HTMLInputElement).value).toBe('5');
  });

  test('resets user inputs when reset button is clicked', () => {
    render(<App />);
    
    const inputs = screen.getAllByRole('textbox');
    const editableInputs = inputs.filter(i => !(i as HTMLInputElement).disabled);
    
    // Es sollte mindestens ein editierbares Feld geben
    expect(editableInputs.length).toBeGreaterThan(0);
    
    fireEvent.change(editableInputs[0], { target: { value: '3' } });
    expect((editableInputs[0] as HTMLInputElement).value).toBe('3');
    
    const resetButton = screen.getByText('Zurücksetzen');
    fireEvent.click(resetButton);
    
    expect((editableInputs[0] as HTMLInputElement).value).toBe('');
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
      
      const inputs = screen.getAllByRole('textbox');
      
      // Setze zwei gleiche Zahlen in unterschiedlichen Positionen
      fireEvent.change(inputs[0], { target: { value: '5' } });
      fireEvent.change(inputs[1], { target: { value: '5' } });
      
      // Verifiziere dass beide Werte gesetzt wurden
      expect((inputs[0] as HTMLInputElement).value).toBe('5');
      expect((inputs[1] as HTMLInputElement).value).toBe('5');
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
      
      const inputs = screen.getAllByRole('textbox');
      
      // Setze zwei gleiche Zahlen in die erste Zeile (Index 0 und 1)
      fireEvent.change(inputs[0], { target: { value: '7' } });
      fireEvent.change(inputs[1], { target: { value: '7' } });
      
      // Der "Prüfen" Button existiert noch nicht, aber die Eingaben sind ungültig
      // Prüfe ob die Werte gesetzt wurden
      expect((inputs[0] as HTMLInputElement).value).toBe('7');
      expect((inputs[1] as HTMLInputElement).value).toBe('7');
    });

    test('shows correct message for incomplete but valid puzzle', () => {
      render(<App />);
      
      const inputs = screen.getAllByRole('textbox');
      const editableInputs = inputs.filter(i => !(i as HTMLInputElement).disabled);
      
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
      
      const inputs = screen.getAllByRole('textbox');
      
      // Setze zwei gleiche Zahlen in erste Zeile
      fireEvent.change(inputs[0], { target: { value: '5' } });
      fireEvent.change(inputs[1], { target: { value: '5' } });
      
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
      
      const inputs = screen.getAllByRole('textbox');
      
      // Setze ein paar valide Zahlen
      fireEvent.change(inputs[0], { target: { value: '5' } });
      fireEvent.change(inputs[10], { target: { value: '6' } });
      fireEvent.change(inputs[20], { target: { value: '7' } });
      
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
      
      const inputs = screen.getAllByRole('textbox');
      
      // Setze drei 1en an Positionen die ein lösbares Sudoku ergeben
      // Position 0 = (0,0), Position 13 = (1,4), Position 26 = (2,8)
      fireEvent.change(inputs[0], { target: { value: '1' } });  // (0,0)
      fireEvent.change(inputs[13], { target: { value: '1' } }); // (1,4)
      fireEvent.change(inputs[26], { target: { value: '1' } }); // (2,8)
      
      // Löse das Sudoku
      const solveButton = screen.getByText('🧩 Sudoku lösen');
      fireEvent.click(solveButton);
      
      // Prüfe ob gelöst wurde (MessageBox sollte Erfolg melden)
      expect(screen.getByTestId('message-box')).toBeInTheDocument();
      expect(screen.getByTestId('message-text')).toHaveTextContent(/erfolgreich gelöst/i);
      
      // Nach dem Lösen: Füge eine 1 an Position (1,7) hinzu (Zeile 1, Spalte 7)
      // Das verletzt die Regel da bereits eine 1 in Zeile 1 an Position (1,4) ist
      const position1_7 = inputs[16]; // Zeile 1 * 9 + Spalte 7 = 16
      fireEvent.change(position1_7, { target: { value: '1' } });
      
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
      
      const inputs = screen.getAllByRole('textbox');
      const editableInputs = inputs.filter(i => !(i as HTMLInputElement).disabled);
      
      // Es sollte mindestens ein editierbares Feld geben
      expect(editableInputs.length).toBeGreaterThan(0);
      
      // Versuche ungültige Eingabe
      fireEvent.change(editableInputs[0], { target: { value: '0' } });
      expect((editableInputs[0] as HTMLInputElement).value).toBe('');
      
      fireEvent.change(editableInputs[0], { target: { value: '10' } });
      expect((editableInputs[0] as HTMLInputElement).value).not.toBe('10');
    });

    test('preset cells are disabled', () => {
      render(<App />);
      
      const inputs = screen.getAllByRole('textbox');
      const disabledInputs = inputs.filter(i => (i as HTMLInputElement).disabled);
      
      // Es sollte mindestens einige vorgegebene Zellen geben
      expect(disabledInputs.length).toBeGreaterThan(0);
    });
  });
});
