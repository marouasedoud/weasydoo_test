module.exports = {
    testEnvironment: "jsdom", // Use jsdom for simulating the browser environment
    transform: {
      '^.+\\.[t|j]sx?$': 'babel-jest', // Transform JS and JSX files using Babel
    },
    setupFilesAfterEnv: ['./jest.setup.js'], // Add this line to point to your setup file
  };
  