import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MessageBox from './MessageBox';

describe('MessageBox Component - Strategy Link Integration', () => {
  test('renders basic message without strategy name', () => {
    render(<MessageBox message="Test Nachricht" type="info" />);
    expect(screen.getByText('Test Nachricht')).toBeInTheDocument();
  });

  test('renders message with strategy name as clickable link', () => {
    const message = '💡 Tipp (Naked Single): Diese Zelle hat nur einen Kandidaten.';
    render(<MessageBox message={message} type="info" />);
    
    const strategyLink = screen.getByRole('button', { name: /naked single/i });
    expect(strategyLink).toBeInTheDocument();
  });

  test('strategy link has correct class', () => {
    const message = '💡 Tipp (Hidden Single): Diese Zahl passt nur hier.';
    render(<MessageBox message={message} type="info" />);
    
    const strategyLink = screen.getByRole('button', { name: /hidden single/i });
    expect(strategyLink).toHaveClass('strategy-link');
  });

  test('clicking strategy link dispatches custom event', () => {
    const message = '💡 Tipp (Naked Pair): Zwei Zellen eliminieren Kandidaten.';
    render(<MessageBox message={message} type="info" />);
    
    const eventListener = jest.fn();
    window.addEventListener('openStrategy', eventListener);
    
    const strategyLink = screen.getByRole('button', { name: /naked pair/i });
    fireEvent.click(strategyLink);
    
    expect(eventListener).toHaveBeenCalled();
    
    window.removeEventListener('openStrategy', eventListener);
  });

  test('custom event contains correct strategy ID', () => {
    const message = '🧠 Tipp (Naked Triple): Drei Zellen teilen drei Kandidaten.';
    render(<MessageBox message={message} type="info" />);
    
    let capturedEventDetail: any = null;
    const eventListener = (e: Event) => {
      capturedEventDetail = (e as CustomEvent).detail;
    };
    
    window.addEventListener('openStrategy', eventListener);
    
    const strategyLink = screen.getByRole('button', { name: /naked triple/i });
    fireEvent.click(strategyLink);
    
    expect(capturedEventDetail).not.toBeNull();
    expect(capturedEventDetail?.strategyId).toBe('naked-triple');
    
    window.removeEventListener('openStrategy', eventListener);
  });

  test('all strategy names are recognized and linked', () => {
    const strategies = [
      { name: 'Naked Single', id: 'naked-single' },
      { name: 'Hidden Single', id: 'hidden-single' },
      { name: 'Naked Pair', id: 'naked-pair' },
      { name: 'Naked Triple', id: 'naked-triple' },
      { name: 'Pointing Pairs', id: 'pointing-pairs' },
      { name: 'Box Line Reduction', id: 'box-line-reduction' }
    ];

    strategies.forEach(strategy => {
      const { unmount } = render(
        <MessageBox 
          message={`💡 Tipp (${strategy.name}): Test`} 
          type="info" 
        />
      );
      
      const strategyLink = screen.getByRole('button', { name: new RegExp(strategy.name, 'i') });
      expect(strategyLink).toBeInTheDocument();
      
      unmount();
    });
  });

  test('message without strategy pattern renders normally', () => {
    const message = 'Gratulation! Du hast das Sudoku gelöst!';
    render(<MessageBox message={message} type="success" />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('message with unrecognized strategy name renders normally', () => {
    const message = '💡 Tipp (Unknown Strategy): Test';
    render(<MessageBox message={message} type="info" />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('renders message parts correctly with strategy link', () => {
    const message = '💡 Tipp (Naked Single): Diese Zelle hat nur einen Kandidaten.';
    render(<MessageBox message={message} type="info" />);
    
    // Vor dem Link
    expect(screen.getByText(/💡 Tipp/)).toBeInTheDocument();
    
    // Der Link selbst
    expect(screen.getByRole('button', { name: /naked single/i })).toBeInTheDocument();
    
    // Nach dem Link
    expect(screen.getByText(/diese zelle hat nur einen kandidaten/i)).toBeInTheDocument();
  });

  test('strategy link has title attribute', () => {
    const message = '💡 Tipp (Hidden Single): Test';
    render(<MessageBox message={message} type="info" />);
    
    const strategyLink = screen.getByRole('button', { name: /hidden single/i });
    expect(strategyLink).toHaveAttribute('title', 'Klicke für mehr Informationen zu dieser Strategie');
  });

  test('multiple messages can have different strategy links', () => {
    const { rerender } = render(
      <MessageBox message="💡 Tipp (Naked Single): Test 1" type="info" />
    );
    
    expect(screen.getByRole('button', { name: /naked single/i })).toBeInTheDocument();
    
    rerender(
      <MessageBox message="🧠 Tipp (Pointing Pairs): Test 2" type="info" />
    );
    
    expect(screen.queryByRole('button', { name: /naked single/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pointing pairs/i })).toBeInTheDocument();
  });

  test('different message types show strategy links correctly', () => {
    const types: Array<'success' | 'error' | 'warning' | 'info'> = ['success', 'error', 'warning', 'info'];
    
    types.forEach(type => {
      const { unmount } = render(
        <MessageBox 
          message="💡 Tipp (Naked Single): Test" 
          type={type} 
        />
      );
      
      const strategyLink = screen.getByRole('button', { name: /naked single/i });
      expect(strategyLink).toBeInTheDocument();
      
      unmount();
    });
  });

  test('renders correct icon for each message type', () => {
    const testCases: Array<{ type: 'success' | 'error' | 'warning' | 'info', icon: string }> = [
      { type: 'success', icon: '✅' },
      { type: 'error', icon: '❌' },
      { type: 'warning', icon: '⚠️' },
      { type: 'info', icon: 'ℹ️' }
    ];

    testCases.forEach(({ type, icon }) => {
      const { unmount } = render(
        <MessageBox message="Test message" type={type} />
      );
      
      expect(screen.getByText(icon)).toBeInTheDocument();
      
      unmount();
    });
  });
});
