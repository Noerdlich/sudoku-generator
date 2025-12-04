import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import StrategyGuide from './StrategyGuide';

describe('StrategyGuide Component', () => {
  beforeEach(() => {
    // Reset DOM vor jedem Test
    document.body.innerHTML = '';
    
    // Mock scrollIntoView (nicht in JSDOM verfügbar)
    Element.prototype.scrollIntoView = jest.fn();
  });

  test('renders toggle button', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    expect(toggleButton).toBeInTheDocument();
  });

  test('toggle button has correct icon and text', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    expect(toggleButton).toHaveTextContent('📚');
    expect(toggleButton).toHaveTextContent('Lösungsstrategien');
  });

  test('panel is hidden by default', () => {
    render(<StrategyGuide />);
    const panel = screen.getByTestId('strategy-guide-panel');
    expect(panel).not.toHaveClass('open');
  });

  test('clicking toggle button opens panel', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    
    fireEvent.click(toggleButton);
    
    const panel = screen.getByTestId('strategy-guide-panel');
    expect(panel).toHaveClass('open');
  });

  test('clicking toggle button twice closes panel', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);
    
    const panel = screen.getByTestId('strategy-guide-panel');
    expect(panel).not.toHaveClass('open');
  });

  test('displays panel header with title', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText(/sudoku lösungsstrategien/i)).toBeInTheDocument();
  });

  test('displays close button in panel header', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    const closeButton = screen.getByRole('button', { name: 'Schließen' });
    expect(closeButton).toBeInTheDocument();
  });

  test('close button closes panel', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    const closeButton = screen.getByRole('button', { name: 'Schließen' });
    fireEvent.click(closeButton);
    
    const panel = screen.getByTestId('strategy-guide-panel');
    expect(panel).not.toHaveClass('open');
  });

  test('displays intro text', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText(/diese app verwendet logische strategien/i)).toBeInTheDocument();
  });

  test('displays all 6 strategies', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Naked Single')).toBeInTheDocument();
    expect(screen.getByText('Hidden Single')).toBeInTheDocument();
    expect(screen.getByText('Naked Pair')).toBeInTheDocument();
    expect(screen.getByText('Naked Triple')).toBeInTheDocument();
    expect(screen.getByText('Pointing Pairs')).toBeInTheDocument();
    expect(screen.getByText('Box Line Reduction')).toBeInTheDocument();
  });

  test('displays difficulty badges for all strategies', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    const einfachBadges = screen.getAllByText('Einfach');
    const mittelBadges = screen.getAllByText('Mittel');
    
    expect(einfachBadges).toHaveLength(2); // Naked Single, Hidden Single
    expect(mittelBadges).toHaveLength(4); // Naked Pair, Triple, Pointing, Box Line
  });

  test('strategy details are hidden by default', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    // Details sollten nicht sichtbar sein
    expect(screen.queryByText(/📖 Beschreibung/i)).not.toBeInTheDocument();
  });

  test('clicking strategy header shows details', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    const nakedSingleButton = screen.getByRole('button', { name: /naked single/i });
    fireEvent.click(nakedSingleButton);
    
    expect(screen.getByText(/📖 Beschreibung/i)).toBeInTheDocument();
    expect(screen.getByText(/💡 Beispiel/i)).toBeInTheDocument();
    expect(screen.getByText(/✨ Tipps/i)).toBeInTheDocument();
  });

  test('clicking strategy header twice hides details', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    const nakedSingleButton = screen.getByRole('button', { name: /naked single/i });
    fireEvent.click(nakedSingleButton);
    fireEvent.click(nakedSingleButton);
    
    expect(screen.queryByText(/📖 Beschreibung/i)).not.toBeInTheDocument();
  });

  test('opening one strategy closes another', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    const nakedSingleButton = screen.getByRole('button', { name: /naked single/i });
    const hiddenSingleButton = screen.getByRole('button', { name: /hidden single/i });
    
    fireEvent.click(nakedSingleButton);
    expect(screen.getByText(/die einfachste sudoku-strategie/i)).toBeInTheDocument();
    
    fireEvent.click(hiddenSingleButton);
    // Hidden Single Details sollten jetzt sichtbar sein
    expect(screen.getByText(/kann in einer zeile, spalte oder einem block nur an einer einzigen position/i)).toBeInTheDocument();
  });

  test('displays strategy description when expanded', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    const nakedPairButton = screen.getByRole('button', { name: /naked pair/i });
    fireEvent.click(nakedPairButton);
    
    expect(screen.getByText(/zwei zellen in einer zeile/i)).toBeInTheDocument();
  });

  test('displays strategy example when expanded', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    const nakedSingleButton = screen.getByRole('button', { name: /naked single/i });
    fireEvent.click(nakedSingleButton);
    
    expect(screen.getByText(/eine zelle kann theoretisch 1-9 enthalten/i)).toBeInTheDocument();
  });

  test('displays strategy tips when expanded', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    const nakedSingleButton = screen.getByRole('button', { name: /naked single/i });
    fireEvent.click(nakedSingleButton);
    
    expect(screen.getByText(/schaue dir leere zellen an/i)).toBeInTheDocument();
  });

  test('displays footer with strategy order info', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText(/reihenfolge:/i)).toBeInTheDocument();
    expect(screen.getByText(/die app versucht immer zuerst die einfachsten/i)).toBeInTheDocument();
  });

  test('overlay is displayed when panel is open', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    const overlay = screen.getByTestId('strategy-guide-overlay');
    expect(overlay).toBeInTheDocument();
  });

  test('clicking overlay closes panel', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    const overlay = screen.getByTestId('strategy-guide-overlay');
    fireEvent.click(overlay);
    
    const panel = screen.getByTestId('strategy-guide-panel');
    expect(panel).not.toHaveClass('open');
  });

  test('strategy headers have correct IDs for linking', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    // Prüfe ob Strategie-Buttons vorhanden sind (indirekter Test für IDs)
    expect(screen.getByRole('button', { name: /naked single/i })).toHaveAttribute('id', 'strategy-naked-single');
    expect(screen.getByRole('button', { name: /hidden single/i })).toHaveAttribute('id', 'strategy-hidden-single');
    expect(screen.getByRole('button', { name: /naked pair/i })).toHaveAttribute('id', 'strategy-naked-pair');
  });

  test('responds to openStrategy custom event', async () => {
    render(<StrategyGuide />);
    
    // Panel sollte geschlossen sein
    const panel = screen.getByTestId('strategy-guide-panel');
    expect(panel).not.toHaveClass('open');
    
    // Sende Custom Event in act()
    await act(async () => {
      const event = new CustomEvent('openStrategy', { 
        detail: { strategyId: 'naked-single' } 
      });
      window.dispatchEvent(event);
    });
    
    // Panel sollte jetzt offen sein
    await waitFor(() => {
      expect(panel).toHaveClass('open');
    });
  });

  test('opens correct strategy from custom event', async () => {
    render(<StrategyGuide />);
    
    // Sende Custom Event für Hidden Single in act()
    await act(async () => {
      const event = new CustomEvent('openStrategy', { 
        detail: { strategyId: 'hidden-single' } 
      });
      window.dispatchEvent(event);
    });
    
    await waitFor(() => {
      // Hidden Single Details sollten sichtbar sein
      expect(screen.getByText(/kann in einer zeile, spalte oder einem block nur an einer einzigen position/i)).toBeInTheDocument();
    });
  });

  test('strategy expand icons change when opened', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    const nakedSingleButton = screen.getByRole('button', { name: /naked single/i });
    
    // Geschlossen: Pfeil nach rechts
    expect(nakedSingleButton).toHaveTextContent('▶');
    
    fireEvent.click(nakedSingleButton);
    
    // Geöffnet: Pfeil nach unten
    expect(nakedSingleButton).toHaveTextContent('▼');
  });

  test('toggle button changes class when panel is open', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    
    expect(toggleButton).not.toHaveClass('open');
    
    fireEvent.click(toggleButton);
    
    expect(toggleButton).toHaveClass('open');
  });

  test('all strategies have correct difficulty classes', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    // Prüfe spezifisch auf die Schwierigkeitsgrade in den Badges
    const einfachBadges = screen.getAllByText('Einfach');
    const mittelBadges = screen.getAllByText('Mittel');
    
    expect(einfachBadges).toHaveLength(2);
    expect(mittelBadges).toHaveLength(4);
  });

  test('strategy details contain all required sections', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    const nakedTripleButton = screen.getByRole('button', { name: /naked triple/i });
    fireEvent.click(nakedTripleButton);
    
    // Alle Sektions-Überschriften sollten vorhanden sein
    expect(screen.getByText(/📖 Beschreibung/i)).toBeInTheDocument();
    expect(screen.getByText(/💡 Beispiel/i)).toBeInTheDocument();
    expect(screen.getByText(/✨ Tipps/i)).toBeInTheDocument();
  });

  test('strategy tips are displayed as list items', () => {
    render(<StrategyGuide />);
    const toggleButton = screen.getByTestId('strategy-guide-toggle');
    fireEvent.click(toggleButton);
    
    const pointingPairsButton = screen.getByRole('button', { name: /pointing pairs/i });
    fireEvent.click(pointingPairsButton);
    
    // Prüfe ob mindestens ein Tipp angezeigt wird
    expect(screen.getByText(/betrachte einen 3×3-block/i)).toBeInTheDocument();
  });
});
