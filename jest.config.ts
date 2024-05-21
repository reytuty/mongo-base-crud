export default {
  clearMocks: true,
  coveragePathIgnorePatterns: ["/node_modules/"],
  coverageProvider: "v8",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  preset: "ts-jest", // Adicione esta linha para usar ts-jest
  testEnvironment: "node",
};
