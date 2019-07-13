module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest-setup.js'],
  coveragePathIgnorePatterns: ['jest-setup.js'],
  modulePathIgnorePatterns: ['<rootDir>/example/'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|react-clone-referenced-element|react-navigation-deprecated-tab-navigator|@react-navigation/core|@react-navigation/native)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testRegex: '/__tests__/.*\\.(test|spec)\\.(js|tsx?)$',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },
};
