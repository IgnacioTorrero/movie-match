module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/test/setup-env.js"],
  setupFilesAfterEnv: ["./jest.setup.ts"], // Configuración opcional para limpiar DB en cada test
};
