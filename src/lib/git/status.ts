import { execGitCommandSafe } from './command-executor';
import { GitError } from './errors';

/**
 * Git Status Operations
 * Handles git status parsing and information retrieval
 */

export interface GitStatus {
  staged: string[];
  unstaged: string[];
  untracked: string[];
}

export interface DetailedGitStatus {
  staged: { count: number; files: string[] };
  unstaged: { count: number; files: string[] };
  untracked: { count: number; files: string[] };
  summary: string;
}

/**
 * Get git status information with error handling
 */
export async function getGitStatus(): Promise<GitStatus> {
  try {
    const output = await execGitCommandSafe('status --porcelain');
    const lines = output.trim().split('\n').filter(line => line.trim());
    
    const staged: string[] = [];
    const unstaged: string[] = [];
    const untracked: string[] = [];
    
    for (const line of lines) {
      if (line.length < 3) continue;
      
      const stagedStatus = line[0];
      const unstagedStatus = line[1];
      const filePath = line.slice(3);
      
      // Check staged status (first character)
      if (stagedStatus !== ' ' && stagedStatus !== '?') {
        staged.push(filePath);
      }
      
      // Check unstaged status (second character)  
      if (unstagedStatus !== ' ' && unstagedStatus !== '?') {
        unstaged.push(filePath);
      }
      
      // Check for untracked files
      if (stagedStatus === '?' && unstagedStatus === '?') {
        untracked.push(filePath);
      }
    }
    
    return { staged, unstaged, untracked };
  } catch (error) {
    if (error instanceof GitError) {
      throw error;
    }
    throw new GitError(`Failed to get git status: ${(error as Error).message}`, 'STATUS_FAILED');
  }
}

/**
 * Get detailed status information with file counts and examples
 */
export async function getDetailedGitStatus(): Promise<DetailedGitStatus> {
  const status = await getGitStatus();
  
  const staged = {
    count: status.staged.length,
    files: status.staged.slice(0, 5) // Show first 5 files
  };
  
  const unstaged = {
    count: status.unstaged.length,
    files: status.unstaged.slice(0, 5)
  };
  
  const untracked = {
    count: status.untracked.length,
    files: status.untracked.slice(0, 5)
  };
  
  // Generate summary message
  let summary = '';
  if (staged.count > 0) {
    summary += `${staged.count} staged file(s)`;
  }
  if (unstaged.count > 0) {
    summary += summary ? `, ${unstaged.count} unstaged file(s)` : `${unstaged.count} unstaged file(s)`;
  }
  if (untracked.count > 0) {
    summary += summary ? `, ${untracked.count} untracked file(s)` : `${untracked.count} untracked file(s)`;
  }
  
  if (!summary) {
    summary = 'Working directory clean';
  }
  
  return { staged, unstaged, untracked, summary };
} 