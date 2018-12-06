const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  ...tsjPreset,
  preset: 'react-native',
  transform: {
    ...tsjPreset.transform,
    '\\.js$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
  },
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
  testPathIgnorePatterns: [
    "\\.snap$",
    "<rootDir>/node_modules/",
    "<rootDir>/dist/"
  ],
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!react-native)/"
  ],
  cacheDirectory: '.jest/cache',
};
