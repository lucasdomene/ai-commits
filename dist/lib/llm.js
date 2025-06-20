"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMError = void 0;
exports.checkOllamaAvailable = checkOllamaAvailable;
exports.checkModelAvailable = checkModelAvailable;
exports.generateCommitMessage = generateCommitMessage;
exports.createCommitPrompt = createCommitPrompt;
exports.parseCommitMessageResponse = parseCommitMessageResponse;
/**
 * LLM integration module
 * Phase 3: LLM Integration
 */
class LLMError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LLMError';
    }
}
exports.LLMError = LLMError;
/**
 * Check if Ollama is available and running
 */
async function checkOllamaAvailable() {
    // TODO: Phase 3 - Implement Ollama availability check
    throw new Error('Not implemented - Phase 3');
}
/**
 * Check if the specified model is available
 */
async function checkModelAvailable(model) {
    // TODO: Phase 3 - Implement model availability check
    throw new Error('Not implemented - Phase 3');
}
/**
 * Generate commit message using LLM
 */
async function generateCommitMessage(prompt, config) {
    // TODO: Phase 3 - Implement LLM commit message generation
    throw new Error('Not implemented - Phase 3');
}
/**
 * Create prompt template for commit message generation
 */
function createCommitPrompt(diff, analysis) {
    // TODO: Phase 3 - Implement prompt template creation
    throw new Error('Not implemented - Phase 3');
}
/**
 * Parse and validate LLM response
 */
function parseCommitMessageResponse(response) {
    // TODO: Phase 3 - Implement response parsing
    throw new Error('Not implemented - Phase 3');
}
//# sourceMappingURL=llm.js.map