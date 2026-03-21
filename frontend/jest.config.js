module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@sentry/.*|zustand|axios)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Use V8 coverage provider to fix compatibility with jest-expo ~54
  coverageProvider: 'v8',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    'store/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  // Thresholds set ~2-3% below actual coverage (34% stmts, 77% branches, 69% funcs, 34% lines)
  // Screen files (app/*.tsx) have 0% coverage and are hard to unit test
  // NOTE: Threshold checking disabled due to jest-expo 54 / Jest 29 compatibility bug
  // (CoverageReporter._checkThreshold crashes on glob.sync undefined)
  // Uncomment when jest-expo fixes this issue:
  // coverageThreshold: {
  //   global: {
  //     statements: 31,
  //     branches: 74,
  //     functions: 66,
  //     lines: 31,
  //   },
  // },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^axios$': '<rootDir>/node_modules/axios',
  },
  roots: ['<rootDir>', '<rootDir>/../shared'],
  modulePaths: ['<rootDir>/node_modules'],
};
