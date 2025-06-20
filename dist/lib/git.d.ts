import { GitDiff } from '../types';
/**
 * Git operations module
 * Phase 2: Git Integration
 */
export declare class GitError extends Error {
    constructor(message: string);
}
/**
 * Check if we're in a git repository
 */
export declare function isGitRepository(): Promise<boolean>;
/**
 * Check if there are staged changes
 */
export declare function hasStagedChanges(): Promise<boolean>;
/**
 * Get the diff of staged changes
 */
export declare function getStagedDiff(): Promise<GitDiff>;
/**
 * Commit changes with the given message
 */
export declare function commitChanges(message: string): Promise<void>;
/**
 * Get git status information
 */
export declare function getGitStatus(): Promise<{
    staged: string[];
    unstaged: string[];
    untracked: string[];
}>;
//# sourceMappingURL=git.d.ts.map