module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/sequelize.js', '!src/server.js'],
  coverageDirectory: 'coverage',
  modulePathIgnorePatterns: ['node_modules'],
  setupFilesAfterEnv: ['./__tests__/setup.js'],
};
