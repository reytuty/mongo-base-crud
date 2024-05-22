"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vite_tsconfig_paths_1 = require("vite-tsconfig-paths");
var config_1 = require("vitest/config");
// https://vitejs.dev/config/
exports.default = (0, config_1.defineConfig)({
    plugins: [(0, vite_tsconfig_paths_1.default)()],
    test: {
        globals: true,
        setupFiles: ['./.vitest/setup.ts'],
    },
});
