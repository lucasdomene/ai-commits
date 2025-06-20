import { LLMResponse } from '../../types';
import { makeOllamaRequest, DEFAULT_OLLAMA_CONFIG } from './http-client';
import { OllamaError } from './errors';

/**
 * Text Generation with Ollama
 * Handles text generation requests and response processing
 */

/**
 * Generate text using Ollama
 */
export async function generateWithOllama(
  prompt: string,
  model: string = DEFAULT_OLLAMA_CONFIG.model,
  baseUrl: string = DEFAULT_OLLAMA_CONFIG.baseUrl,
  options: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  } = {}
): Promise<LLMResponse> {
  try {
    const requestBody = {
      model,
      prompt,
      stream: options.stream || false,
      options: {
        temperature: options.temperature || 0.1, // Low temperature for consistent commit messages
        num_predict: options.maxTokens || 200,   // Reasonable limit for commit messages
      }
    };
    
    const response = await makeOllamaRequest('/api/generate', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    }, baseUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new OllamaError(`Generation failed: ${response.status} ${response.statusText}`, errorText);
    }
    
    const data = await response.json() as {
      response?: string;
      prompt_eval_count?: number;
      eval_count?: number;
    };
    
    if (!data.response) {
      throw new OllamaError('No response from model', JSON.stringify(data));
    }
    
    return {
      content: data.response.trim(),
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0
      }
    };
  } catch (error) {
    if (error instanceof OllamaError) {
      throw error;
    }
    throw new OllamaError('Failed to generate with Ollama', (error as Error).message);
  }
} 