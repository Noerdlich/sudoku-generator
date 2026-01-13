import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NumberKeyboard from './NumberKeyboard';

describe('NumberKeyboard Component', () => {
  const mockOnNumberClick = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all number buttons 1-9', () => {
    render(
      <NumberKeyboard
        onNumberClick={mockOnNumberClick}
        onDelete={mockOnDelete}
        disabled={false}
      />
    );

    // Prüfe dass alle 9 Zahlen-Buttons vorhanden sind
    for (let i = 1; i <= 9; i++) {
      const button = screen.getByRole('button', { name: `Number ${i}` });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(i.toString());
    }
  });

  test('renders delete button with correct symbol', () => {
    render(
      <NumberKeyboard
        onNumberClick={mockOnNumberClick}
        onDelete={mockOnDelete}
        disabled={false}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveTextContent('⌫');
  });

  test('buttons are arranged in two rows (1-5, 6-9+delete)', () => {
    render(
      <NumberKeyboard
        onNumberClick={mockOnNumberClick}
        onDelete={mockOnDelete}
        disabled={false}
      />
    );

    const keyboard = screen.getByRole('button', { name: 'Number 1' }).closest('.number-keyboard');
    expect(keyboard).toBeInTheDocument();
    
    const rows = keyboard?.querySelectorAll('.keyboard-row');
    expect(rows).toHaveLength(2);
  });

  test('calls onNumberClick with correct number when number button is clicked', () => {
    render(
      <NumberKeyboard
        onNumberClick={mockOnNumberClick}
        onDelete={mockOnDelete}
        disabled={false}
      />
    );

    for (let i = 1; i <= 9; i++) {
      const button = screen.getByRole('button', { name: `Number ${i}` });
      fireEvent.click(button);
      expect(mockOnNumberClick).toHaveBeenCalledWith(i);
    }

    expect(mockOnNumberClick).toHaveBeenCalledTimes(9);
  });

  test('calls onDelete when delete button is clicked', () => {
    render(
      <NumberKeyboard
        onNumberClick={mockOnNumberClick}
        onDelete={mockOnDelete}
        disabled={false}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnNumberClick).not.toHaveBeenCalled();
  });

  test('all buttons are disabled when disabled prop is true', () => {
    render(
      <NumberKeyboard
        onNumberClick={mockOnNumberClick}
        onDelete={mockOnDelete}
        disabled={true}
      />
    );

    // Prüfe Zahlen-Buttons
    for (let i = 1; i <= 9; i++) {
      const button = screen.getByRole('button', { name: `Number ${i}` });
      expect(button).toBeDisabled();
    }

    // Prüfe Delete-Button
    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton).toBeDisabled();
  });

  test('disabled buttons do not trigger callbacks', () => {
    render(
      <NumberKeyboard
        onNumberClick={mockOnNumberClick}
        onDelete={mockOnDelete}
        disabled={true}
      />
    );

    const numberButton = screen.getByRole('button', { name: 'Number 5' });
    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    fireEvent.click(numberButton);
    fireEvent.click(deleteButton);

    expect(mockOnNumberClick).not.toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  test('buttons are enabled when disabled prop is false', () => {
    render(
      <NumberKeyboard
        onNumberClick={mockOnNumberClick}
        onDelete={mockOnDelete}
        disabled={false}
      />
    );

    // Prüfe Zahlen-Buttons
    for (let i = 1; i <= 9; i++) {
      const button = screen.getByRole('button', { name: `Number ${i}` });
      expect(button).not.toBeDisabled();
    }

    // Prüfe Delete-Button
    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton).not.toBeDisabled();
  });

  test('delete button has correct CSS class', () => {
    render(
      <NumberKeyboard
        onNumberClick={mockOnNumberClick}
        onDelete={mockOnDelete}
        disabled={false}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton).toHaveClass('keyboard-btn');
    expect(deleteButton).toHaveClass('keyboard-delete');
  });

  test('number buttons have correct CSS class', () => {
    render(
      <NumberKeyboard
        onNumberClick={mockOnNumberClick}
        onDelete={mockOnDelete}
        disabled={false}
      />
    );

    const button = screen.getByRole('button', { name: 'Number 1' });
    expect(button).toHaveClass('keyboard-btn');
  });

  test('clicking multiple buttons in sequence calls callbacks correctly', () => {
    render(
      <NumberKeyboard
        onNumberClick={mockOnNumberClick}
        onDelete={mockOnDelete}
        disabled={false}
      />
    );

    const button1 = screen.getByRole('button', { name: 'Number 1' });
    const button5 = screen.getByRole('button', { name: 'Number 5' });
    const button9 = screen.getByRole('button', { name: 'Number 9' });
    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    fireEvent.click(button1);
    fireEvent.click(button5);
    fireEvent.click(button9);
    fireEvent.click(deleteButton);

    expect(mockOnNumberClick).toHaveBeenCalledTimes(3);
    expect(mockOnNumberClick).toHaveBeenNthCalledWith(1, 1);
    expect(mockOnNumberClick).toHaveBeenNthCalledWith(2, 5);
    expect(mockOnNumberClick).toHaveBeenNthCalledWith(3, 9);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });
});
