// Main LLM module - exports all functionality
export * from './errors';
export * from './http-client';
export * from './model-manager';
export * from './generator';
export * from './prompt-builder';

import { Config, LLMResponse } from '../../types';
import { LLMError } from './errors';
import { checkOllamaAvailable, checkModelAvailable, pullModel } from './model-manager';
import { generateWithOllama } from './generator';

/**
 * Main LLM Service
 * High-level interface for commit message generation
 */

/**
 * Generate commit message using LLM
 */
export async function generateCommitMessage(
  prompt: string,
  config: Config
): Promise<LLMResponse> {
  try {
    // Check if Ollama is available
    const isAvailable = await checkOllamaAvailable(config.llm.baseUrl);
    if (!isAvailable) {
      throw new LLMError('Ollama is not available or not running', 'OLLAMA_UNAVAILABLE', 
        'Start Ollama with: ollama serve');
    }
    
    // Check if model is available
    const modelAvailable = await checkModelAvailable(config.llm.model, config.llm.baseUrl);
    if (!modelAvailable) {
      console.log(`⚠️  Model ${config.llm.model} not found locally. Attempting to pull...`);
      await pullModel(config.llm.model, config.llm.baseUrl);
    }
    
    // Generate the commit message
    const response = await generateWithOllama(
      prompt,
      config.llm.model,
      config.llm.baseUrl,
      {
        temperature: 0.1, // Low temperature for consistent formatting
        maxTokens: 150    // Reasonable limit for commit messages
      }
    );
    
    return response;
  } catch (error) {
    if (error instanceof LLMError) {
      // Re-throw LLM errors with recovery hints
      if (error.recoveryHint) {
        console.error(`\n💡 Recovery suggestion:\n${error.recoveryHint}`);
      }
      throw error;
    }
    
    throw new LLMError(`Failed to generate commit message: ${(error as Error).message}`, 'GENERATION_FAILED');
  }
}

/**
 * Validate Ollama configuration
 */
export async function validateOllamaConfig(config: Config): Promise<void> {
  try {
    // Check if Ollama is running
    const isAvailable = await checkOllamaAvailable(config.llm.baseUrl);
    if (!isAvailable) {
      throw new LLMError('Ollama is not running or not accessible', 'OLLAMA_UNAVAILABLE',
        'Start Ollama with: ollama serve');
    }
    
    // Check if model is available
    const modelAvailable = await checkModelAvailable(config.llm.model, config.llm.baseUrl);
    if (!modelAvailable) {
      console.warn(`⚠️  Model ${config.llm.model} is not available locally`);
      console.log(`💡 Pull it with: ollama pull ${config.llm.model}`);
    }
    
    console.log('✅ Ollama configuration is valid');
  } catch (error) {
    if (error instanceof LLMError && error.recoveryHint) {
      console.error(`\n💡 Recovery suggestion:\n${error.recoveryHint}`);
    }
    throw error;
  }
} 