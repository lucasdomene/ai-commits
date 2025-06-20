import { execSync } from 'child_process';
import { GitError, GitRepositoryError, GitStagingError, GitCommandError } from './errors';

/**
 * Git Command Executor
 * Handles low-level git command execution with error handling and retry logic
 */

/**
 * Execute git command with enhanced error handling
 */
export function execGitCommand(command: string): string {
  try {
    return execSync(`git ${command}`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).toString();
  } catch (error: any) {
    const errorMessage = error.stderr || error.message || 'Unknown git error';
    const exitCode = error.status;
    
    // Handle specific git errors with better messages
    if (errorMessage.includes('not a git repository')) {
      throw new GitRepositoryError('Not in a git repository');
    }
    
    throw new GitCommandError(command, errorMessage, exitCode);
  }
}

/**
 * Execute git command with timeout and retry logic
 */
export async function execGitCommandSafe(command: string, retries: number = 1): Promise<string> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return execGitCommand(command);
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry certain errors
      if (error instanceof GitRepositoryError || 
          error instanceof GitStagingError ||
          (error as any).code === 'NOT_A_REPOSITORY') {
        throw error;
      }
      
      // Only retry on transient errors
      const errorMessage = (error as any).message || '';
      if (errorMessage.includes('index.lock') && attempt < retries) {
        console.warn(`⚠️  Git operation failed (attempt ${attempt}/${retries}), retrying...`);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError!;
} 