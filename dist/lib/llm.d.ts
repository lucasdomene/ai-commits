import { LLMResponse, Config } from '../types';
/**
 * LLM integration module
 * Phase 3: LLM Integration
 */
export declare class LLMError extends Error {
    constructor(message: string);
}
/**
 * Check if Ollama is available and running
 */
export declare function checkOllamaAvailable(): Promise<boolean>;
/**
 * Check if the specified model is available
 */
export declare function checkModelAvailable(model: string): Promise<boolean>;
/**
 * Generate commit message using LLM
 */
export declare function generateCommitMessage(prompt: string, config: Config): Promise<LLMResponse>;
/**
 * Create prompt template for commit message generation
 */
export declare function createCommitPrompt(diff: string, analysis: any): string;
/**
 * Parse and validate LLM response
 */
export declare function parseCommitMessageResponse(response: string): {
    type: string;
    scope?: string;
    description: string;
    body?: string;
};
//# sourceMappingURL=llm.d.ts.map