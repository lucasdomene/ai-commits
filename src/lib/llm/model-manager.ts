import { makeOllamaRequest } from './http-client';
import { OllamaError } from './errors';

/**
 * Model Management for Ollama
 * Handles model availability, listing, and downloading
 */

/**
 * Check if Ollama is available and running
 */
export async function checkOllamaAvailable(baseUrl?: string): Promise<boolean> {
  try {
    const response = await makeOllamaRequest('/api/tags', {
      method: 'GET'
    }, baseUrl);
    
    return response.ok;
  } catch (error) {
    console.warn('⚠️  Ollama availability check failed:', (error as Error).message);
    return false;
  }
}

/**
 * Get list of available models from Ollama
 */
export async function getAvailableModels(baseUrl?: string): Promise<string[]> {
  try {
    const response = await makeOllamaRequest('/api/tags', {
      method: 'GET'
    }, baseUrl);
    
    if (!response.ok) {
      throw new OllamaError(`Failed to get models: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as { models?: { name: string }[] };
    return data.models?.map((model) => model.name) || [];
  } catch (error) {
    if (error instanceof OllamaError) {
      throw error;
    }
    throw new OllamaError('Failed to get available models', (error as Error).message);
  }
}

/**
 * Check if the specified model is available
 */
export async function checkModelAvailable(model: string, baseUrl?: string): Promise<boolean> {
  try {
    const availableModels = await getAvailableModels(baseUrl);
    return availableModels.includes(model);
  } catch (error) {
    console.warn(`⚠️  Model availability check failed for ${model}:`, (error as Error).message);
    return false;
  }
}

/**
 * Pull a model from Ollama
 */
export async function pullModel(model: string, baseUrl?: string): Promise<void> {
  try {
    console.log(`📥 Pulling model ${model}...`);
    
    const response = await makeOllamaRequest('/api/pull', {
      method: 'POST',
      body: JSON.stringify({ name: model })
    }, baseUrl, 300000); // 5 minute timeout for model pulling
    
    if (!response.ok) {
      throw new OllamaError(`Failed to pull model ${model}: ${response.status} ${response.statusText}`);
    }
    
    // Stream the response to show progress
    const reader = response.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line) as {
              status?: string;
              completed?: number;
              total?: number;
            };
            if (data.status) {
              process.stdout.write(`\r${data.status}`);
              if (data.completed && data.total) {
                const percent = Math.round((data.completed / data.total) * 100);
                process.stdout.write(` ${percent}%`);
              }
            }
          } catch {
            // Ignore invalid JSON lines
          }
        }
      }
    }
    
    console.log(`\n✅ Model ${model} pulled successfully`);
  } catch (error) {
    if (error instanceof OllamaError) {
      throw error;
    }
    throw new OllamaError(`Failed to pull model ${model}`, (error as Error).message);
  }
} 