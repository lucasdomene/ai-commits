import { GitDiff, GitFile } from '../types';

/**
 * Git operations module
 * Phase 2: Git Integration
 */

export class GitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitError';
  }
}

/**
 * Check if we're in a git repository
 */
export async function isGitRepository(): Promise<boolean> {
  // TODO: Phase 2 - Implement git repository detection
  throw new Error('Not implemented - Phase 2');
}

/**
 * Check if there are staged changes
 */
export async function hasStagedChanges(): Promise<boolean> {
  // TODO: Phase 2 - Implement staged changes detection
  throw new Error('Not implemented - Phase 2');
}

/**
 * Get the diff of staged changes
 */
export async function getStagedDiff(): Promise<GitDiff> {
  // TODO: Phase 2 - Implement git diff --staged parsing
  throw new Error('Not implemented - Phase 2');
}

/**
 * Commit changes with the given message
 */
export async function commitChanges(message: string): Promise<void> {
  // TODO: Phase 2 - Implement git commit functionality
  throw new Error('Not implemented - Phase 2');
}

/**
 * Get git status information
 */
export async function getGitStatus(): Promise<{
  staged: string[];
  unstaged: string[];
  untracked: string[];
}> {
  // TODO: Phase 2 - Implement git status parsing
  throw new Error('Not implemented - Phase 2');
} 