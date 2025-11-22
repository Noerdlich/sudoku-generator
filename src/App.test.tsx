import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  test('allows input in custom mode', () => {
    render(<App />);
    const customButton = screen.getByText('Eigenes Sudoku');
    fireEvent.click(customButton);
    
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '5' } });
    expect((inputs[0] as HTMLInputElement).value).toBe('5');
  });
});
