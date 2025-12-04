import React, { useState, useEffect } from 'react';
import './StrategyGuide.css';

interface Strategy {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  example: string;
  tips: string[];
}

const strategies: Strategy[] = [
  {
    id: 'naked-single',
    name: 'Naked Single',
    difficulty: 'easy',
    description: 'Die einfachste Sudoku-Strategie. Eine Zelle hat nur einen einzigen möglichen Kandidaten, nachdem alle Zahlen aus Zeile, Spalte und Block eliminiert wurden.',
    example: 'Eine Zelle kann theoretisch 1-9 enthalten, aber in ihrer Zeile stehen bereits 1,2,3,4,5,6,7,8 → nur die 9 ist möglich.',
    tips: [
      'Schaue dir leere Zellen an und zähle, welche Zahlen bereits in Zeile, Spalte und Block vorkommen',
      'Wenn nur eine Zahl übrig bleibt, hast du einen Naked Single gefunden',
      'Dies ist die schnellste Methode und sollte immer zuerst versucht werden'
    ]
  },
  {
    id: 'hidden-single',
    name: 'Hidden Single',
    difficulty: 'easy',
    description: 'Eine Zahl kann in einer Zeile, Spalte oder einem Block nur an einer einzigen Position platziert werden, auch wenn diese Zelle mehrere Kandidaten hat.',
    example: 'In Zeile 5 kann die 7 theoretisch in mehreren Zellen stehen, aber nur eine davon hat die 7 als gültigen Kandidaten → die 7 muss dort hin.',
    tips: [
      'Wähle eine Zahl (z.B. 7) und schaue, wo sie in einer Zeile noch platziert werden kann',
      'Wenn nur eine Position möglich ist, hast du einen Hidden Single gefunden',
      'Wiederhole dies für alle Zeilen, Spalten und Blöcke'
    ]
  },
  {
    id: 'naked-pair',
    name: 'Naked Pair',
    difficulty: 'medium',
    description: 'Zwei Zellen in einer Zeile, Spalte oder einem Block haben beide exakt die gleichen zwei Kandidaten. Diese beiden Zahlen können dann aus allen anderen Zellen dieser Einheit eliminiert werden.',
    example: 'In Zeile 3 haben Zelle (3,2) und Zelle (3,5) beide nur die Kandidaten {4,8}. Dann kann keine andere Zelle in Zeile 3 die 4 oder 8 enthalten.',
    tips: [
      'Suche nach zwei Zellen mit identischen zwei Kandidaten',
      'Diese beiden Zahlen müssen in diesen beiden Zellen stehen',
      'Eliminiere diese Zahlen aus allen anderen Zellen der gleichen Einheit',
      'Manchmal führt dies zu einem Naked Single in einer anderen Zelle'
    ]
  },
  {
    id: 'naked-triple',
    name: 'Naked Triple',
    difficulty: 'medium',
    description: 'Drei Zellen in einer Einheit teilen sich zusammen genau drei Kandidaten. Diese drei Zahlen können dann aus allen anderen Zellen eliminiert werden.',
    example: 'Drei Zellen haben die Kandidaten {1,4}, {1,4,9}, {4,9}. Zusammen sind das nur die drei Zahlen {1,4,9}, also ein Naked Triple.',
    tips: [
      'Die einzelnen Zellen müssen nicht alle drei Zahlen enthalten',
      'Wichtig ist, dass zusammen nur drei verschiedene Zahlen vorkommen',
      'Jede Zelle muss 2 oder 3 Kandidaten haben',
      'Dies ist schwieriger zu erkennen als Naked Pairs'
    ]
  },
  {
    id: 'pointing-pairs',
    name: 'Pointing Pairs',
    difficulty: 'medium',
    description: 'Ein Kandidat kommt in einem Block nur in einer Zeile oder Spalte vor. Dann kann dieser Kandidat aus dem Rest dieser Zeile/Spalte (außerhalb des Blocks) eliminiert werden.',
    example: 'Im linken oberen Block kommt die 6 nur in Zeile 2 vor (Spalten 0,1,2). Dann kann die 6 nicht in den anderen Zellen von Zeile 2 (Spalten 3-8) stehen.',
    tips: [
      'Betrachte einen 3×3-Block und wähle eine Zahl',
      'Wenn diese Zahl nur in einer Zeile des Blocks möglich ist, eliminiere sie aus dem Rest dieser Zeile',
      'Das gleiche gilt für Spalten',
      'Auch "Box/Line Reduction" genannt'
    ]
  },
  {
    id: 'box-line-reduction',
    name: 'Box Line Reduction',
    difficulty: 'medium',
    description: 'Ein Kandidat kommt in einer Zeile oder Spalte nur innerhalb eines Blocks vor. Dann kann dieser Kandidat aus dem Rest dieses Blocks (in anderen Zeilen/Spalten) eliminiert werden.',
    example: 'In Zeile 4 kommt die 3 nur in den Spalten 6,7,8 vor (alle im rechten mittleren Block). Dann kann die 3 in den anderen Zeilen (5 und 6) dieses Blocks nicht vorkommen.',
    tips: [
      'Betrachte eine Zeile und wähle eine Zahl',
      'Wenn diese Zahl nur innerhalb eines Blocks möglich ist, eliminiere sie aus den anderen Zeilen dieses Blocks',
      'Das gleiche gilt für Spalten',
      'Dies ist die Umkehrung von Pointing Pairs'
    ]
  }
];

const StrategyGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStrategy, setActiveStrategy] = useState<string | null>(null);

  const toggleGuide = () => {
    setIsOpen(!isOpen);
  };

  const toggleStrategy = (id: string) => {
    setActiveStrategy(activeStrategy === id ? null : id);
  };

  // Event-Listener für externe Aufrufe (z.B. von Tipp-Nachrichten)
  useEffect(() => {
    const handleOpenStrategy = (event: CustomEvent<{ strategyId: string }>) => {
      const strategyId = event.detail.strategyId;
      setIsOpen(true);
      setActiveStrategy(strategyId);
      
      // Scrolle zur Strategie nach kurzer Verzögerung
      setTimeout(() => {
        const element = document.getElementById(`strategy-${strategyId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    };

    window.addEventListener('openStrategy' as any, handleOpenStrategy as any);
    return () => {
      window.removeEventListener('openStrategy' as any, handleOpenStrategy as any);
    };
  }, []);

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Einfach';
      case 'medium': return 'Mittel';
      case 'hard': return 'Schwer';
      default: return difficulty;
    }
  };

  return (
    <>
      <button 
        className={`strategy-guide-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleGuide}
        aria-label="Strategien Guide öffnen/schließen"
      >
        <span className="icon">📚</span>
        <span className="text">Lösungsstrategien</span>
      </button>

      <div className={`strategy-guide-panel ${isOpen ? 'open' : ''}`}>
        <div className="strategy-guide-header">
          <h2>🎓 Sudoku Lösungsstrategien</h2>
          <button 
            className="close-button" 
            onClick={toggleGuide}
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        <div className="strategy-guide-content">
          <p className="intro">
            Diese App verwendet logische Strategien, um dir intelligente Tipps zu geben. 
            Klicke auf eine Strategie, um mehr zu erfahren.
          </p>

          <div className="strategies-list">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="strategy-item">
                <button
                  id={`strategy-${strategy.id}`}
                  className={`strategy-header ${activeStrategy === strategy.id ? 'active' : ''}`}
                  onClick={() => toggleStrategy(strategy.id)}
                >
                  <span className="strategy-name">{strategy.name}</span>
                  <span 
                    className={`strategy-difficulty ${strategy.difficulty}`}
                  >
                    {getDifficultyLabel(strategy.difficulty)}
                  </span>
                  <span className="expand-icon">
                    {activeStrategy === strategy.id ? '▼' : '▶'}
                  </span>
                </button>

                {activeStrategy === strategy.id && (
                  <div className="strategy-details">
                    <div className="strategy-section">
                      <h4>📖 Beschreibung</h4>
                      <p>{strategy.description}</p>
                    </div>

                    <div className="strategy-section">
                      <h4>💡 Beispiel</h4>
                      <p className="example">{strategy.example}</p>
                    </div>

                    <div className="strategy-section">
                      <h4>✨ Tipps</h4>
                      <ul>
                        {strategy.tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="strategy-footer">
            <p>
              <strong>Reihenfolge:</strong> Die App versucht immer zuerst die einfachsten 
              Strategien (Naked/Hidden Single), bevor sie zu komplexeren Techniken übergeht.
            </p>
          </div>
        </div>
      </div>

      {isOpen && <div className="strategy-guide-overlay" onClick={toggleGuide} />}
    </>
  );
};

export default StrategyGuide;
