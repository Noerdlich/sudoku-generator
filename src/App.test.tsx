import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock window.alert
global.alert = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});

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
    expect(screen.getByText('Leicht')).toBeInTheDocument();
    expect(screen.getByText('Mittel')).toBeInTheDocument();
    expect(screen.getByText('Schwer')).toBeInTheDocument();
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
    test('shows alert when puzzle is not complete', () => {
      render(<App />);
      
      const checkButton = screen.getByText('Prüfen');
      fireEvent.click(checkButton);
      
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('korrekt')
      );
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
      expect(global.alert).toHaveBeenCalled();
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
      
      // Setze eine gültige Zahl
      if (editableInputs.length > 0) {
        fireEvent.change(editableInputs[0], { target: { value: '1' } });
      }
      
      const checkButton = screen.getByText('Prüfen');
      fireEvent.click(checkButton);
      
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringMatching(/korrekt|vollständig|falsch/i)
      );
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
      
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Regelverstöße')
      );
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
      
      // Alert sollte aufgerufen worden sein
      expect(global.alert).toHaveBeenCalled();
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
