module.exports = {
  preset: 'react-scripts',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '<rootDir>/test/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/setupTests.ts'
  ],
  // Schnellere Test-Ausführung
  maxWorkers: '50%',
  // Cache für schnellere wiederholte Ausführungen
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  // Nur geänderte Dateien testen im Watch-Modus
  watchPathIgnorePatterns: ['node_modules', 'build', '.git'],
  // Schnellere Transformationen
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'react-scripts/config/jest/babelTransform.js',
    '^.+\\.css$': 'react-scripts/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': 'react-scripts/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
  ],
  // Timeout für langsame Tests
  testTimeout: 10000,
};
