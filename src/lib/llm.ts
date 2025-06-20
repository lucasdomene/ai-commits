import { LLMRequest, LLMResponse, Config } from '../types';

/**
 * LLM integration module
 * Phase 3: LLM Integration
 */

export class LLMError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMError';
  }
}

/**
 * Check if Ollama is available and running
 */
export async function checkOllamaAvailable(): Promise<boolean> {
  // TODO: Phase 3 - Implement Ollama availability check
  throw new Error('Not implemented - Phase 3');
}

/**
 * Check if the specified model is available
 */
export async function checkModelAvailable(model: string): Promise<boolean> {
  // TODO: Phase 3 - Implement model availability check
  throw new Error('Not implemented - Phase 3');
}

/**
 * Generate commit message using LLM
 */
export async function generateCommitMessage(
  prompt: string,
  config: Config
): Promise<LLMResponse> {
  // TODO: Phase 3 - Implement LLM commit message generation
  throw new Error('Not implemented - Phase 3');
}

/**
 * Create prompt template for commit message generation
 */
export function createCommitPrompt(
  diff: string,
  analysis: any
): string {
  // TODO: Phase 3 - Implement prompt template creation
  throw new Error('Not implemented - Phase 3');
}

/**
 * Parse and validate LLM response
 */
export function parseCommitMessageResponse(response: string): {
  type: string;
  scope?: string;
  description: string;
  body?: string;
} {
  // TODO: Phase 3 - Implement response parsing
  throw new Error('Not implemented - Phase 3');
} 