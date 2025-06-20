import { execGitCommandSafe } from './command-executor';
import { GitRepositoryError, GitStagingError } from './errors';

/**
 * Git Repository Operations
 * Handles repository-level operations and validation
 */

/**
 * Check if we're in a git repository
 */
export async function isGitRepository(): Promise<boolean> {
  try {
    await execGitCommandSafe('rev-parse --git-dir');
    return true;
  } catch (error) {
    if (error instanceof GitRepositoryError) {
      return false;
    }
    // For other errors, still return false but log the issue
    console.warn('⚠️  Error checking git repository status:', (error as Error).message);
    return false;
  }
}

/**
 * Check if there are staged changes
 */
export async function hasStagedChanges(): Promise<boolean> {
  try {
    const output = await execGitCommandSafe('diff --staged --name-only');
    return output.trim().length > 0;
  } catch (error) {
    if (error instanceof GitRepositoryError) {
      throw error;
    }
    console.warn('⚠️  Error checking staged changes:', (error as Error).message);
    return false;
  }
}

/**
 * Validate git repository and staged changes with enhanced error handling
 */
export async function validateGitState(): Promise<void> {
  // Check if we're in a git repository
  if (!(await isGitRepository())) {
    throw new GitRepositoryError('Not in a git repository. Please run this command from within a git repository.');
  }

  // Check if there are any staged changes
  if (!(await hasStagedChanges())) {
    // Try to get additional context for better error message
    try {
      const statusOutput = await execGitCommandSafe('status --porcelain');
      const lines = statusOutput.trim().split('\n').filter(line => line.trim());
      
      let unstagedCount = 0;
      let untrackedCount = 0;
      
      for (const line of lines) {
        if (line.length < 3) continue;
        const stagedStatus = line[0];
        const unstagedStatus = line[1];
        
        if (unstagedStatus !== ' ' && unstagedStatus !== '?') {
          unstagedCount++;
        }
        if (stagedStatus === '?' && unstagedStatus === '?') {
          untrackedCount++;
        }
      }
      
      throw new GitStagingError('No staged changes found', unstagedCount, untrackedCount);
    } catch (error) {
      if (error instanceof GitStagingError) {
        throw error;
      }
      // If we can't get status, provide a generic staging error
      throw new GitStagingError('No staged changes found. Please stage some changes before proceeding.');
    }
  }
}

/**
 * Check if there are any commits in the repository
 */
export async function hasCommits(): Promise<boolean> {
  try {
    await execGitCommandSafe('log -1 --oneline');
    return true;
  } catch (error) {
    // If the error is about no commits, return false
    const errorMessage = (error as any).message || '';
    if (errorMessage.includes('does not have any commits yet') || 
        errorMessage.includes('bad default revision') ||
        errorMessage.includes('ambiguous argument \'HEAD\'')) {
      return false;
    }
    
    // For other errors, still return false but log
    console.warn('⚠️  Error checking commit history:', errorMessage);
    return false;
  }
} 