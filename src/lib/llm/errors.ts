/**
 * LLM Error Classes
 * Handles all LLM-related error types and recovery hints
 */

export class LLMError extends Error {
  constructor(message: string, public code?: string, public recoveryHint?: string) {
    super(message);
    this.name = 'LLMError';
  }
}

export class OllamaError extends LLMError {
  constructor(message: string, originalError?: string) {
    let recoveryHint = 'Check that Ollama is installed and running.';
    
    if (originalError?.includes('ECONNREFUSED') || originalError?.includes('fetch failed')) {
      recoveryHint = 'Ollama is not running. Start it with:\n' +
        '  ollama serve\n' +
        'Or install it with:\n' +
        '  brew install ollama';
    } else if (originalError?.includes('model') && originalError?.includes('not found')) {
      recoveryHint = 'The specified model is not available. Pull it with:\n' +
        '  ollama pull <model-name>\n' +
        'Or list available models with:\n' +
        '  ollama list';
    }
    
    super(message, 'OLLAMA_ERROR', recoveryHint);
  }
} 