"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    clearMocks: true,
    coveragePathIgnorePatterns: ["/node_modules/"],
    coverageProvider: "v8",
    testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
    preset: "ts-jest",
    testEnvironment: "node",
};
