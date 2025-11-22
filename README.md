# 🎲 Sudoku Generator

Eine React-basierte Web-App zum Generieren und Lösen von Sudoku-Rätseln.

## ✨ Features

- **Lösbare Sudokus**: Alle generierten Sudokus haben garantiert genau eine Lösung
- **Doppelte Achsen-Symmetrie**: Zahlen werden symmetrisch auf beiden Achsen (horizontal und vertikal) entfernt
- **3 Schwierigkeitsgrade**: Leicht, Mittel, Schwer
- **Interaktive Lösung**: Überprüfe deine Lösung mit dem Prüfen-Button
- **Responsive Design**: Funktioniert auf Desktop und Mobilgeräten
- **GitHub Pages Ready**: Einfaches Deployment als statische Website

## 🚀 Live Demo

Die App ist verfügbar unter: [https://Noerdlich.github.io/sudoku-generator](https://Noerdlich.github.io/sudoku-generator)

## 🛠️ Installation & Entwicklung

### Voraussetzungen

- Node.js (Version 16 oder höher)
- npm

### Lokale Entwicklung

```bash
# Repository klonen
git clone https://github.com/Noerdlich/sudoku-generator.git
cd sudoku-generator

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm start
```

Die App öffnet sich automatisch unter [http://localhost:3000](http://localhost:3000).

### Build für Produktion

```bash
npm run build
```

Erstellt eine optimierte Production-Build im `build/` Ordner.

## 📦 Deployment auf GitHub Pages

### Automatisches Deployment

Die App ist mit GitHub Actions für automatisches Deployment konfiguriert:

1. Push deine Änderungen zum `main` Branch
2. GitHub Actions baut und deployt automatisch

### Manuelles Deployment

```bash
npm run deploy
```

### GitHub Pages einrichten

1. Gehe zu deinem Repository auf GitHub
2. Navigiere zu **Settings** → **Pages**
3. Wähle unter **Source**: `GitHub Actions`
4. Die App wird automatisch unter `https://<dein-username>.github.io/sudoku-generator` verfügbar sein

## 🎮 Verwendung

1. **Schwierigkeit wählen**: Klicke auf Leicht, Mittel oder Schwer, um ein neues Sudoku zu generieren
2. **Zahlen eingeben**: Klicke in ein leeres Feld und gib eine Zahl von 1-9 ein
3. **Eigene Eingaben**: Deine Eingaben werden in Blau angezeigt
4. **Prüfen**: Klicke auf "Prüfen", um deine Lösung zu überprüfen und Feedback zu erhalten
5. **Lösung anzeigen**: Zeige die vollständige Lösung an
6. **Zurücksetzen**: Lösche alle deine Eingaben und starte neu

## 🧠 Algorithmus

Die App verwendet einen Backtracking-Algorithmus mit folgenden Schritten:

1. **Vollständiges Grid generieren**: Erstellt ein vollständig ausgefülltes, gültiges Sudoku
2. **Symmetrisches Entfernen**: Entfernt Zahlen mit doppelter Achsen-Symmetrie (horizontal und vertikal gespiegelt)
3. **Eindeutigkeit prüfen**: Stellt sicher, dass das Sudoku genau eine Lösung hat
4. **Schwierigkeitsanpassung**: Entfernt mehr Zahlen für höhere Schwierigkeitsgrade

### Symmetrie-Erklärung

Bei der Zahlenentfernung wird eine **doppelte Achsen-Symmetrie** verwendet:
- Wenn eine Zahl an Position (r, c) entfernt wird
- Werden auch die Zahlen an (8-r, c), (r, 8-c) und (8-r, 8-c) entfernt
- Dies erzeugt ein visuell ausgewogenes und ästhetisches Muster

## 📁 Projektstruktur

```
sudoku-generator/
├── src/
│   ├── components/
│   │   ├── SudokuBoard.tsx      # Sudoku-Board Komponente
│   │   └── SudokuBoard.css      # Board Styling
│   ├── utils/
│   │   └── sudokuGenerator.ts   # Sudoku-Generator Logik
│   ├── App.tsx                  # Haupt-App Komponente
│   ├── App.css                  # App Styling
│   ├── index.tsx                # Entry Point
│   └── index.css                # Globale Styles
├── public/                      # Statische Assets
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions Workflow
├── package.json
└── README.md
```

## 🔧 Technologie-Stack

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **CSS3** - Styling mit Gradients & Animations
- **GitHub Actions** - CI/CD
- **GitHub Pages** - Hosting

## 📝 Lizenz

MIT License - Siehe LICENSE Datei für Details

## 👤 Autor

Erstellt von [Noerdlich](https://github.com/Noerdlich)
