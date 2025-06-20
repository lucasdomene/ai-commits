"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
exports.loadConfig = loadConfig;
exports.mergeConfig = mergeConfig;
exports.validateConfig = validateConfig;
/**
 * Configuration management module
 * Phase 6: Configuration
 */
/**
 * Default configuration
 */
exports.DEFAULT_CONFIG = {
    llm: {
        provider: 'ollama',
        baseUrl: 'http://localhost:11434',
        model: 'llama3.2:3b'
    },
    commitFormat: {
        maxLength: 72,
        includeBody: false
    },
    scopeDetection: {
        enabled: true,
        rules: [
            { pattern: 'src/components/**', scope: 'components' },
            { pattern: 'src/lib/**', scope: 'lib' },
            { pattern: 'docs/**', scope: 'docs' },
            { pattern: '*.test.*', scope: 'tests' },
            { pattern: 'package.json', scope: 'deps' }
        ]
    }
};
/**
 * Load configuration from file
 */
async function loadConfig(configPath) {
    // TODO: Phase 6 - Implement config file loading
    throw new Error('Not implemented - Phase 6');
}
/**
 * Merge user config with defaults
 */
function mergeConfig(userConfig) {
    // TODO: Phase 6 - Implement config merging
    throw new Error('Not implemented - Phase 6');
}
/**
 * Validate configuration
 */
function validateConfig(config) {
    // TODO: Phase 6 - Implement config validation
    throw new Error('Not implemented - Phase 6');
}
//# sourceMappingURL=config.js.map