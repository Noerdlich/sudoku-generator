// Sudoku Solver, der verschiedene logische Lösungsstrategien implementiert
// Diese Strategien werden verwendet, um dem Spieler intelligente Hinweise zu geben

export type SudokuGrid = number[][];

/**
 * Schnittstelle für ein Hinweis-Ergebnis.
 * Enthält alle Informationen, die benötigt werden, um dem Spieler
 * einen hilfreichen Hinweis mit Erklärung zu geben.
 */
export interface HintResult {
  row: number; // Zeilen-Position der Zelle (0-8)
  col: number; // Spalten-Position der Zelle (0-8)
  value: number; // Die einzutragende Zahl (1-9)
  strategy: string; // Name der angewandten Strategie
  explanation: string; // Menschenlesbare Erklärung auf Deutsch
  difficulty: "easy" | "medium" | "hard"; // Schwierigkeit der Strategie

  // Optional: Zusätzliche Details für erweiterte Erklärungen
  affectedCells?: [number, number][]; // Welche Zellen werden beeinflusst
  eliminatedCandidates?: number[]; // Welche Kandidaten wurden eliminiert
}

/**
 * Ermittelt alle möglichen Kandidaten (1-9) für eine leere Zelle.
 * 
 * Die Funktion eliminiert alle Zahlen, die bereits in der gleichen
 * Zeile, Spalte oder im gleichen 3x3-Block vorkommen.
 * 
 * @param grid Das Sudoku-Spielfeld
 * @param row Zeilen-Position der Zelle (0-8)
 * @param col Spalten-Position der Zelle (0-8)
 * @returns Array mit allen möglichen Zahlen für diese Zelle
 */
export function getCandidates(
  grid: SudokuGrid,
  row: number,
  col: number
): number[] {
  // Wenn die Zelle bereits gefüllt ist, gibt es keine Kandidaten
  if (grid[row][col] !== 0) return [];
  
  // Starte mit allen Zahlen von 1-9 als mögliche Kandidaten
  const candidates = new Set<number>();
  for (let num = 1; num <= 9; num++) {
    candidates.add(num);
  }

  // Entferne alle Zahlen, die in der gleichen Zeile, Spalte oder im gleichen Block vorkommen
  for (let i = 0; i < 9; i++) {
    // Entferne Zahlen aus der gleichen Zeile
    candidates.delete(grid[row][i]);
    
    // Entferne Zahlen aus der gleichen Spalte
    candidates.delete(grid[i][col]);
    
    // Entferne Zahlen aus dem gleichen 3x3-Block
    const blockRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const blockCol = 3 * Math.floor(col / 3) + (i % 3);
    candidates.delete(grid[blockRow][blockCol]);
  }
  
  return Array.from(candidates).sort((a, b) => a - b);
}

/**
 * Naked Single Strategie:
 * Findet eine Zelle, die nur einen einzigen möglichen Kandidaten hat.
 * 
 * Dies ist die einfachste Sudoku-Strategie. Wenn nach Eliminierung aller
 * bereits verwendeten Zahlen in Zeile, Spalte und Block nur noch eine
 * einzige Zahl übrig bleibt, muss diese in die Zelle eingetragen werden.
 * 
 * Beispiel: Eine Zelle kann theoretisch 1-9 enthalten, aber in ihrer
 * Zeile stehen bereits 1,2,3,4,5,6,7,8 → nur 9 ist möglich.
 * 
 * @param grid Das Sudoku-Spielfeld
 * @returns HintResult mit der Lösung oder null, wenn keine gefunden wurde
 */
export function findNakedSingle(grid: SudokuGrid): HintResult | null {
  // Durchlaufe alle Zellen des Spielfelds
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      // Prüfe nur leere Zellen
      if (grid[row][col] === 0) {
        // Ermittle alle möglichen Kandidaten für diese Zelle
        const candidates = getCandidates(grid, row, col);
        
        // Wenn nur ein einziger Kandidat übrig ist, haben wir einen Naked Single gefunden
        if (candidates.length === 1) {
          return {
            row,
            col,
            value: candidates[0],
            strategy: "Naked Single",
            explanation: `In Zeile ${row + 1}, Spalte ${col + 1} ist nur die ${candidates[0]} möglich.`,
            difficulty: "easy",
          };
        }
      }
    }
  }
  
  // Kein Naked Single gefunden
  return null;
}

/**
 * Hidden Single Strategie:
 * Findet eine Zahl, die in einer Zeile, Spalte oder einem Block nur
 * an einer einzigen Position platziert werden kann.
 * 
 * Im Gegensatz zum Naked Single hat die Zelle hier möglicherweise mehrere
 * Kandidaten, aber eine bestimmte Zahl kann in der betrachteten Einheit
 * (Zeile/Spalte/Block) nur an dieser einen Stelle stehen.
 * 
 * Beispiel: In Zeile 5 kann die 7 in mehreren Zellen theoretisch stehen,
 * aber nur eine davon hat die 7 als Kandidat → die 7 muss dort hin.
 * 
 * @param grid Das Sudoku-Spielfeld
 * @returns HintResult mit der Lösung oder null, wenn keine gefunden wurde
 */
export function findHiddenSingle(grid: SudokuGrid): HintResult | null {
  // ========== Prüfe alle Zeilen ==========
  for (let row = 0; row < 9; row++) {
    // Map speichert für jede Zahl (1-9) die Spalten, in denen sie stehen kann
    const candidateMap: { [key: number]: number[] } = {};
    
    // Sammle für jede leere Zelle in dieser Zeile die Kandidaten
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const candidates = getCandidates(grid, row, col);
        
        // Für jeden Kandidaten merken wir uns, in welcher Spalte er möglich ist
        for (const candidate of candidates) {
          if (!candidateMap[candidate]) {
            candidateMap[candidate] = [];
          }
          candidateMap[candidate].push(col);
        }
      }
    }
    
    // Prüfe, ob es eine Zahl gibt, die nur an einer Position möglich ist
    for (const candidate in candidateMap) {
      if (candidateMap[candidate].length === 1) {
        const col = candidateMap[candidate][0];
        return {
          row,
          col,
          value: parseInt(candidate),
          strategy: "Hidden Single",
          explanation: `In Zeile ${row + 1} kann die ${candidate} nur in Spalte ${col + 1} stehen.`,
          difficulty: "easy"
        };
      }
    }
  }

  // ========== Prüfe alle Spalten ==========
  for (let col = 0; col < 9; col++) {
    // Map speichert für jede Zahl (1-9) die Zeilen, in denen sie stehen kann
    const candidateMap: { [key: number]: number[] } = {};
    
    // Sammle für jede leere Zelle in dieser Spalte die Kandidaten
    for (let row = 0; row < 9; row++) {
      if (grid[row][col] === 0) {
        const candidates = getCandidates(grid, row, col);
        
        // Für jeden Kandidaten merken wir uns, in welcher Zeile er möglich ist
        for (const candidate of candidates) {
          if (!candidateMap[candidate]) {
            candidateMap[candidate] = [];
          }
          candidateMap[candidate].push(row);
        }
      }
    }
    
    // Prüfe, ob es eine Zahl gibt, die nur an einer Position möglich ist
    for (const candidate in candidateMap) {
      if (candidateMap[candidate].length === 1) {
        const row = candidateMap[candidate][0];
        return {
          row,
          col,
          value: parseInt(candidate),
          strategy: "Hidden Single",
          explanation: `In Spalte ${col + 1} kann die ${candidate} nur in Zeile ${row + 1} stehen.`,
          difficulty: "easy"
        };
      }
    }
  }

  // ========== Prüfe alle 3x3-Blöcke ==========
  for (let blockRow = 0; blockRow < 3; blockRow++) {
    for (let blockCol = 0; blockCol < 3; blockCol++) {
      // Map speichert für jede Zahl (1-9) die Positionen, an denen sie stehen kann
      const candidateMap: { [key: number]: [number, number][] } = {};
      
      // Durchlaufe alle 9 Zellen des aktuellen Blocks
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const row = blockRow * 3 + i;
          const col = blockCol * 3 + j;
          
          if (grid[row][col] === 0) {
            const candidates = getCandidates(grid, row, col);
            
            // Für jeden Kandidaten merken wir uns die Position
            for (const candidate of candidates) {
              if (!candidateMap[candidate]) {
                candidateMap[candidate] = [];
              }
              candidateMap[candidate].push([row, col]);
            }
          }
        }
      }
      
      // Prüfe, ob es eine Zahl gibt, die nur an einer Position möglich ist
      for (const candidate in candidateMap) {
        if (candidateMap[candidate].length === 1) {
          const [row, col] = candidateMap[candidate][0];
          return {
            row,
            col,
            value: parseInt(candidate),
            strategy: "Hidden Single",
            explanation: `Im Block (${blockRow + 1}, ${blockCol + 1}) kann die ${candidate} nur in Zelle (${row + 1}, ${col + 1}) stehen.`,
            difficulty: "easy"
          };
        }
      }
    }
  }

  // Kein Hidden Single gefunden
  return null;
}

/**
 * Naked Pair Strategie:
 * Findet zwei Zellen in einer Zeile, Spalte oder einem Block, die beide
 * exakt die gleichen zwei Kandidaten haben.
 * 
 * Wenn zwei Zellen in einer Einheit nur die gleichen zwei Zahlen als
 * Kandidaten haben (z.B. beide nur {3,7}), dann müssen diese beiden
 * Zahlen in diesen beiden Zellen stehen. Deshalb können wir diese
 * Zahlen aus allen anderen Zellen dieser Einheit eliminieren.
 * 
 * Diese Strategie gibt keinen direkten Wert zurück, sondern reduziert
 * die Kandidaten anderer Zellen. Daher suchen wir nach einer Zelle,
 * die durch diese Eliminierung zu einem Naked Single wird.
 * 
 * Beispiel: In Zeile 3 haben Zelle (3,2) und Zelle (3,5) beide nur
 * die Kandidaten {4,8}. Dann kann keine andere Zelle in Zeile 3 die
 * 4 oder 8 enthalten.
 * 
 * @param grid Das Sudoku-Spielfeld
 * @returns HintResult mit der Lösung oder null, wenn keine gefunden wurde
 */
export function findNakedPair(grid: SudokuGrid): HintResult | null {
  // Hilfsfunktion zum Prüfen einer Gruppe von Zellen (Zeile, Spalte oder Block)
  const checkGroup = (cells: [number, number][]): HintResult | null => {
    // Sammle für jede Zelle ihre Kandidaten
    const cellCandidates: { pos: [number, number]; candidates: number[] }[] = [];
    
    for (const [row, col] of cells) {
      if (grid[row][col] === 0) {
        const candidates = getCandidates(grid, row, col);
        // Nur Zellen mit genau 2 Kandidaten sind für Naked Pairs relevant
        if (candidates.length === 2) {
          cellCandidates.push({ pos: [row, col], candidates });
        }
      }
    }
    
    // Suche nach zwei Zellen mit identischen Kandidaten
    for (let i = 0; i < cellCandidates.length; i++) {
      for (let j = i + 1; j < cellCandidates.length; j++) {
        const cell1 = cellCandidates[i];
        const cell2 = cellCandidates[j];
        
        // Prüfe, ob beide Zellen die gleichen Kandidaten haben
        if (
          cell1.candidates[0] === cell2.candidates[0] &&
          cell1.candidates[1] === cell2.candidates[1]
        ) {
          // Naked Pair gefunden! Jetzt eliminiere diese Zahlen aus anderen Zellen
          const pairValues = cell1.candidates;
          
          // Prüfe alle anderen leeren Zellen in dieser Gruppe
          for (const [row, col] of cells) {
            // Überspringe die beiden Pair-Zellen selbst
            if (
              (row === cell1.pos[0] && col === cell1.pos[1]) ||
              (row === cell2.pos[0] && col === cell2.pos[1])
            ) {
              continue;
            }
            
            if (grid[row][col] === 0) {
              // Berechne Kandidaten ohne das Naked Pair
              const candidates = getCandidates(grid, row, col).filter(
                c => !pairValues.includes(c)
              );
              
              // Wenn nach Eliminierung nur noch ein Kandidat übrig ist,
              // haben wir eine lösbare Zelle gefunden
              if (candidates.length === 1) {
                return {
                  row,
                  col,
                  value: candidates[0],
                  strategy: "Naked Pair",
                  explanation: `Die Zellen (${cell1.pos[0] + 1}, ${cell1.pos[1] + 1}) und (${cell2.pos[0] + 1}, ${cell2.pos[1] + 1}) bilden ein Naked Pair mit {${pairValues[0]}, ${pairValues[1]}}. Daher kann in (${row + 1}, ${col + 1}) nur noch ${candidates[0]} stehen.`,
                  difficulty: "medium",
                  affectedCells: [cell1.pos, cell2.pos],
                };
              }
            }
          }
        }
      }
    }
    
    return null;
  };
  
  // ========== Prüfe alle Zeilen ==========
  for (let row = 0; row < 9; row++) {
    const cells: [number, number][] = [];
    for (let col = 0; col < 9; col++) {
      cells.push([row, col]);
    }
    const result = checkGroup(cells);
    if (result) return result;
  }
  
  // ========== Prüfe alle Spalten ==========
  for (let col = 0; col < 9; col++) {
    const cells: [number, number][] = [];
    for (let row = 0; row < 9; row++) {
      cells.push([row, col]);
    }
    const result = checkGroup(cells);
    if (result) return result;
  }
  
  // ========== Prüfe alle Blöcke ==========
  for (let blockRow = 0; blockRow < 3; blockRow++) {
    for (let blockCol = 0; blockCol < 3; blockCol++) {
      const cells: [number, number][] = [];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          cells.push([blockRow * 3 + i, blockCol * 3 + j]);
        }
      }
      const result = checkGroup(cells);
      if (result) return result;
    }
  }
  
  // Kein Naked Pair gefunden, das zu einer Lösung führt
  return null;
}

/**
 * Naked Triple Strategie:
 * Findet drei Zellen in einer Zeile, Spalte oder einem Block, die zusammen
 * nur drei bestimmte Zahlen als Kandidaten haben.
 * 
 * Wenn drei Zellen in einer Einheit zusammen nur drei verschiedene Zahlen
 * als Kandidaten haben (z.B. Zelle A: {2,5}, Zelle B: {2,7}, Zelle C: {5,7}),
 * dann müssen diese drei Zahlen in diesen drei Zellen stehen. Deshalb können
 * wir diese Zahlen aus allen anderen Zellen dieser Einheit eliminieren.
 * 
 * Wichtig: Die einzelnen Zellen müssen nicht alle drei Zahlen enthalten,
 * aber zusammen dürfen sie keine weiteren Zahlen haben.
 * 
 * Beispiel: Drei Zellen haben die Kandidaten {1,4}, {1,4,9}, {4,9}.
 * Zusammen sind das nur die drei Zahlen {1,4,9}, also ein Naked Triple.
 * 
 * @param grid Das Sudoku-Spielfeld
 * @returns HintResult mit der Lösung oder null, wenn keine gefunden wurde
 */
export function findNakedTriple(grid: SudokuGrid): HintResult | null {
  // Hilfsfunktion zum Prüfen einer Gruppe von Zellen
  const checkGroup = (cells: [number, number][]): HintResult | null => {
    // Sammle für jede Zelle ihre Kandidaten (nur Zellen mit 2 oder 3 Kandidaten)
    const cellCandidates: { pos: [number, number]; candidates: number[] }[] = [];
    
    for (const [row, col] of cells) {
      if (grid[row][col] === 0) {
        const candidates = getCandidates(grid, row, col);
        // Für Naked Triples sind nur Zellen mit 2 oder 3 Kandidaten relevant
        if (candidates.length >= 2 && candidates.length <= 3) {
          cellCandidates.push({ pos: [row, col], candidates });
        }
      }
    }
    
    // Suche nach drei Zellen, die zusammen genau 3 verschiedene Zahlen haben
    for (let i = 0; i < cellCandidates.length; i++) {
      for (let j = i + 1; j < cellCandidates.length; j++) {
        for (let k = j + 1; k < cellCandidates.length; k++) {
          const cell1 = cellCandidates[i];
          const cell2 = cellCandidates[j];
          const cell3 = cellCandidates[k];
          
          // Vereinige alle Kandidaten der drei Zellen
          const unionSet = new Set([
            ...cell1.candidates,
            ...cell2.candidates,
            ...cell3.candidates,
          ]);
          
          // Prüfe, ob die Vereinigung genau 3 verschiedene Zahlen ergibt
          if (unionSet.size === 3) {
            // Naked Triple gefunden!
            const tripleValues = Array.from(unionSet);
            
            // Prüfe alle anderen leeren Zellen in dieser Gruppe
            for (const [row, col] of cells) {
              // Überspringe die drei Triple-Zellen selbst
              if (
                (row === cell1.pos[0] && col === cell1.pos[1]) ||
                (row === cell2.pos[0] && col === cell2.pos[1]) ||
                (row === cell3.pos[0] && col === cell3.pos[1])
              ) {
                continue;
              }
              
              if (grid[row][col] === 0) {
                // Berechne Kandidaten ohne das Naked Triple
                const candidates = getCandidates(grid, row, col).filter(
                  c => !tripleValues.includes(c)
                );
                
                // Wenn nach Eliminierung nur noch ein Kandidat übrig ist,
                // haben wir eine lösbare Zelle gefunden
                if (candidates.length === 1) {
                  return {
                    row,
                    col,
                    value: candidates[0],
                    strategy: "Naked Triple",
                    explanation: `Die Zellen (${cell1.pos[0] + 1}, ${cell1.pos[1] + 1}), (${cell2.pos[0] + 1}, ${cell2.pos[1] + 1}) und (${cell3.pos[0] + 1}, ${cell3.pos[1] + 1}) bilden ein Naked Triple mit {${tripleValues.join(', ')}}. Daher kann in (${row + 1}, ${col + 1}) nur noch ${candidates[0]} stehen.`,
                    difficulty: "medium",
                    affectedCells: [cell1.pos, cell2.pos, cell3.pos],
                  };
                }
              }
            }
          }
        }
      }
    }
    
    return null;
  };
  
  // ========== Prüfe alle Zeilen ==========
  for (let row = 0; row < 9; row++) {
    const cells: [number, number][] = [];
    for (let col = 0; col < 9; col++) {
      cells.push([row, col]);
    }
    const result = checkGroup(cells);
    if (result) return result;
  }
  
  // ========== Prüfe alle Spalten ==========
  for (let col = 0; col < 9; col++) {
    const cells: [number, number][] = [];
    for (let row = 0; row < 9; row++) {
      cells.push([row, col]);
    }
    const result = checkGroup(cells);
    if (result) return result;
  }
  
  // ========== Prüfe alle Blöcke ==========
  for (let blockRow = 0; blockRow < 3; blockRow++) {
    for (let blockCol = 0; blockCol < 3; blockCol++) {
      const cells: [number, number][] = [];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          cells.push([blockRow * 3 + i, blockCol * 3 + j]);
        }
      }
      const result = checkGroup(cells);
      if (result) return result;
    }
  }
  
  // Kein Naked Triple gefunden, das zu einer Lösung führt
  return null;
}

/**
 * Pointing Pairs Strategie (auch "Box/Line Reduction" genannt):
 * Findet eine Zahl, die in einem Block nur in einer Zeile oder Spalte
 * vorkommt, und eliminiert sie aus dem Rest dieser Zeile/Spalte.
 * 
 * Wenn in einem 3x3-Block ein bestimmter Kandidat nur in einer einzigen
 * Zeile (oder Spalte) des Blocks vorkommt, dann muss dieser Kandidat
 * auch in dieser Zeile innerhalb des Blocks stehen. Daher kann dieser
 * Kandidat aus allen Zellen außerhalb des Blocks in dieser Zeile
 * eliminiert werden.
 * 
 * Beispiel: Im linken oberen Block kommt die 6 nur in Zeile 2 vor
 * (in den Zellen der Spalten 0,1,2). Dann kann die 6 nicht in den
 * Zellen von Zeile 2 außerhalb dieses Blocks (Spalten 3-8) stehen.
 * 
 * @param grid Das Sudoku-Spielfeld
 * @returns HintResult mit der Lösung oder null, wenn keine gefunden wurde
 */
export function findPointingPairs(grid: SudokuGrid): HintResult | null {
  // ========== Prüfe alle Blöcke ==========
  for (let blockRow = 0; blockRow < 3; blockRow++) {
    for (let blockCol = 0; blockCol < 3; blockCol++) {
      // Für jede Zahl (1-9) sammeln wir die Positionen im Block
      for (let num = 1; num <= 9; num++) {
        const positions: [number, number][] = [];
        
        // Durchlaufe alle Zellen des Blocks
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const row = blockRow * 3 + i;
            const col = blockCol * 3 + j;
            
            if (grid[row][col] === 0) {
              const candidates = getCandidates(grid, row, col);
              if (candidates.includes(num)) {
                positions.push([row, col]);
              }
            }
          }
        }
        
        // Wenn die Zahl 2-3 mal im Block vorkommt, prüfe Pointing Pairs
        if (positions.length >= 2 && positions.length <= 3) {
          // Prüfe, ob alle Positionen in der gleichen Zeile liegen
          const sameRow = positions.every(([r]) => r === positions[0][0]);
          if (sameRow) {
            const row = positions[0][0];
            
            // Prüfe Zellen in dieser Zeile außerhalb des Blocks
            for (let col = 0; col < 9; col++) {
              // Überspringe Zellen innerhalb des Blocks
              const cellBlockCol = Math.floor(col / 3);
              if (cellBlockCol === blockCol) continue;
              
              if (grid[row][col] === 0) {
                // Berechne Kandidaten ohne die Pointing Pair Zahl
                const candidates = getCandidates(grid, row, col).filter(
                  c => c !== num
                );
                
                // Prüfe, ob die Zahl tatsächlich eliminiert werden kann
                const originalCandidates = getCandidates(grid, row, col);
                if (originalCandidates.includes(num) && candidates.length === 1) {
                  return {
                    row,
                    col,
                    value: candidates[0],
                    strategy: "Pointing Pairs",
                    explanation: `Im Block (${blockRow + 1}, ${blockCol + 1}) kann die ${num} nur in Zeile ${row + 1} stehen. Daher kann in (${row + 1}, ${col + 1}) nur noch ${candidates[0]} stehen.`,
                    difficulty: "medium",
                    affectedCells: positions,
                  };
                }
              }
            }
          }
          
          // Prüfe, ob alle Positionen in der gleichen Spalte liegen
          const sameCol = positions.every(([, c]) => c === positions[0][1]);
          if (sameCol) {
            const col = positions[0][1];
            
            // Prüfe Zellen in dieser Spalte außerhalb des Blocks
            for (let row = 0; row < 9; row++) {
              // Überspringe Zellen innerhalb des Blocks
              const cellBlockRow = Math.floor(row / 3);
              if (cellBlockRow === blockRow) continue;
              
              if (grid[row][col] === 0) {
                // Berechne Kandidaten ohne die Pointing Pair Zahl
                const candidates = getCandidates(grid, row, col).filter(
                  c => c !== num
                );
                
                // Prüfe, ob die Zahl tatsächlich eliminiert werden kann
                const originalCandidates = getCandidates(grid, row, col);
                if (originalCandidates.includes(num) && candidates.length === 1) {
                  return {
                    row,
                    col,
                    value: candidates[0],
                    strategy: "Pointing Pairs",
                    explanation: `Im Block (${blockRow + 1}, ${blockCol + 1}) kann die ${num} nur in Spalte ${col + 1} stehen. Daher kann in (${row + 1}, ${col + 1}) nur noch ${candidates[0]} stehen.`,
                    difficulty: "medium",
                    affectedCells: positions,
                  };
                }
              }
            }
          }
        }
      }
    }
  }
  
  // Keine Pointing Pairs gefunden, die zu einer Lösung führen
  return null;
}

/**
 * Box Line Reduction Strategie (umgekehrte Pointing Pairs):
 * Findet eine Zahl, die in einer Zeile oder Spalte nur innerhalb eines
 * Blocks vorkommt, und eliminiert sie aus dem Rest dieses Blocks.
 * 
 * Wenn in einer Zeile (oder Spalte) ein bestimmter Kandidat nur innerhalb
 * eines einzigen Blocks vorkommt, dann muss dieser Kandidat in diesem
 * Block auch in dieser Zeile stehen. Daher kann dieser Kandidat aus allen
 * anderen Zeilen (oder Spalten) innerhalb des Blocks eliminiert werden.
 * 
 * Beispiel: In Zeile 4 kommt die 3 nur in den Spalten 6,7,8 vor (alle
 * im rechten mittleren Block). Dann kann die 3 in den anderen Zeilen
 * (5 und 6) dieses Blocks nicht vorkommen.
 * 
 * @param grid Das Sudoku-Spielfeld
 * @returns HintResult mit der Lösung oder null, wenn keine gefunden wurde
 */
export function findBoxLineReduction(grid: SudokuGrid): HintResult | null {
  // ========== Prüfe alle Zeilen ==========
  for (let row = 0; row < 9; row++) {
    // Für jede Zahl (1-9) sammeln wir die Positionen in der Zeile
    for (let num = 1; num <= 9; num++) {
      const positions: [number, number][] = [];
      
      // Durchlaufe alle Spalten der Zeile
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          const candidates = getCandidates(grid, row, col);
          if (candidates.includes(num)) {
            positions.push([row, col]);
          }
        }
      }
      
      // Wenn die Zahl 2-3 mal in der Zeile vorkommt, prüfe Box Line Reduction
      if (positions.length >= 2 && positions.length <= 3) {
        // Prüfe, ob alle Positionen im gleichen Block liegen
        const blockCol = Math.floor(positions[0][1] / 3);
        const sameBlock = positions.every(
          ([, c]) => Math.floor(c / 3) === blockCol
        );
        
        if (sameBlock) {
          const blockRow = Math.floor(row / 3);
          
          // Prüfe andere Zellen im gleichen Block, aber in anderen Zeilen
          for (let i = 0; i < 3; i++) {
            const checkRow = blockRow * 3 + i;
            if (checkRow === row) continue; // Überspringe die ursprüngliche Zeile
            
            for (let j = 0; j < 3; j++) {
              const checkCol = blockCol * 3 + j;
              
              if (grid[checkRow][checkCol] === 0) {
                // Berechne Kandidaten ohne die Box Line Reduction Zahl
                const candidates = getCandidates(grid, checkRow, checkCol).filter(
                  c => c !== num
                );
                
                // Prüfe, ob die Zahl tatsächlich eliminiert werden kann
                const originalCandidates = getCandidates(grid, checkRow, checkCol);
                if (originalCandidates.includes(num) && candidates.length === 1) {
                  return {
                    row: checkRow,
                    col: checkCol,
                    value: candidates[0],
                    strategy: "Box Line Reduction",
                    explanation: `In Zeile ${row + 1} kann die ${num} nur im Block (${blockRow + 1}, ${blockCol + 1}) stehen. Daher kann in (${checkRow + 1}, ${checkCol + 1}) nur noch ${candidates[0]} stehen.`,
                    difficulty: "medium",
                    affectedCells: positions,
                  };
                }
              }
            }
          }
        }
      }
    }
  }
  
  // ========== Prüfe alle Spalten ==========
  for (let col = 0; col < 9; col++) {
    // Für jede Zahl (1-9) sammeln wir die Positionen in der Spalte
    for (let num = 1; num <= 9; num++) {
      const positions: [number, number][] = [];
      
      // Durchlaufe alle Zeilen der Spalte
      for (let row = 0; row < 9; row++) {
        if (grid[row][col] === 0) {
          const candidates = getCandidates(grid, row, col);
          if (candidates.includes(num)) {
            positions.push([row, col]);
          }
        }
      }
      
      // Wenn die Zahl 2-3 mal in der Spalte vorkommt, prüfe Box Line Reduction
      if (positions.length >= 2 && positions.length <= 3) {
        // Prüfe, ob alle Positionen im gleichen Block liegen
        const blockRow = Math.floor(positions[0][0] / 3);
        const sameBlock = positions.every(
          ([r]) => Math.floor(r / 3) === blockRow
        );
        
        if (sameBlock) {
          const blockCol = Math.floor(col / 3);
          
          // Prüfe andere Zellen im gleichen Block, aber in anderen Spalten
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              const checkRow = blockRow * 3 + i;
              const checkCol = blockCol * 3 + j;
              
              if (checkCol === col) continue; // Überspringe die ursprüngliche Spalte
              
              if (grid[checkRow][checkCol] === 0) {
                // Berechne Kandidaten ohne die Box Line Reduction Zahl
                const candidates = getCandidates(grid, checkRow, checkCol).filter(
                  c => c !== num
                );
                
                // Prüfe, ob die Zahl tatsächlich eliminiert werden kann
                const originalCandidates = getCandidates(grid, checkRow, checkCol);
                if (originalCandidates.includes(num) && candidates.length === 1) {
                  return {
                    row: checkRow,
                    col: checkCol,
                    value: candidates[0],
                    strategy: "Box Line Reduction",
                    explanation: `In Spalte ${col + 1} kann die ${num} nur im Block (${blockRow + 1}, ${blockCol + 1}) stehen. Daher kann in (${checkRow + 1}, ${checkCol + 1}) nur noch ${candidates[0]} stehen.`,
                    difficulty: "medium",
                    affectedCells: positions,
                  };
                }
              }
            }
          }
        }
      }
    }
  }
  
  // Keine Box Line Reduction gefunden, die zu einer Lösung führt
  return null;
}