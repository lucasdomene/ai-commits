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
 * Validate git repository and staged changes
 */
export declare function validateGitState(): Promise<void>;
/**
 * Get git status information
 */
export declare function getGitStatus(): Promise<{
    staged: string[];
    unstaged: string[];
    untracked: string[];
}>;
/**
 * Get detailed status information with file counts and examples
 */
export declare function getDetailedGitStatus(): Promise<{
    staged: {
        count: number;
        files: string[];
    };
    unstaged: {
        count: number;
        files: string[];
    };
    untracked: {
        count: number;
        files: string[];
    };
    summary: string;
}>;
/**
 * Get the diff of staged changes
 */
export declare function getStagedDiff(): Promise<GitDiff>;
/**
 * Commit changes with the given message
 */
export declare function commitChanges(message: string): Promise<void>;
//# sourceMappingURL=git.d.ts.map