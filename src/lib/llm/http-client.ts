import { fetch, RequestInit, Response } from 'undici';
import { OllamaError } from './errors';

/**
 * HTTP Client for Ollama API
 * Handles all HTTP communication with Ollama service
 */

/**
 * Default Ollama configuration
 */
export const DEFAULT_OLLAMA_CONFIG = {
  baseUrl: 'http://localhost:11434',
  model: 'llama3.2:3b',
  timeout: 30000, // 30 seconds
} as const;

/**
 * Make HTTP request to Ollama API
 */
export async function makeOllamaRequest(
  endpoint: string, 
  options: RequestInit = {}, 
  baseUrl: string = DEFAULT_OLLAMA_CONFIG.baseUrl,
  timeout: number = DEFAULT_OLLAMA_CONFIG.timeout
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new OllamaError('Request timed out', `Timeout after ${timeout}ms`);
    }
    
    throw new OllamaError('Failed to connect to Ollama', error.message);
  }
} 