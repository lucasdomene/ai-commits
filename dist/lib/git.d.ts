import { GitDiff } from '../types';
/**
 * Git operations module
 * Phase 2: Git Integration
 */
export declare class GitError extends Error {
    code?: string | undefined;
    recoveryHint?: string | undefined;
    constructor(message: string, code?: string | undefined, recoveryHint?: string | undefined);
}
export declare class GitRepositoryError extends GitError {
    constructor(message: string);
}
export declare class GitStagingError extends GitError {
    constructor(message: string, unstagedCount?: number, untrackedCount?: number);
}
export declare class GitCommitError extends GitError {
    constructor(message: string, originalError?: string);
}
export declare class GitCommandError extends GitError {
    constructor(command: string, originalError: string, exitCode?: number);
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
 * Validate git repository and staged changes with enhanced error handling
 */
export declare function validateGitState(): Promise<void>;
/**
 * Validate commit message format
 */
export declare function validateCommitMessage(message: string): void;
/**
 * Commit changes with enhanced error handling
 */
export declare function commitChanges(message: string): Promise<void>;
/**
 * Commit changes with a multi-line message (subject + body) with enhanced error handling
 */
export declare function commitChangesWithBody(subject: string, body?: string): Promise<void>;
/**
 * Get the last commit information with error handling
 */
export declare function getLastCommit(): Promise<{
    hash: string;
    subject: string;
    author: string;
    date: string;
}>;
/**
 * Check if there are any commits in the repository
 */
export declare function hasCommits(): Promise<boolean>;
/**
 * Get git status information with error handling
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
 * Get the diff of staged changes with error handling
 */
export declare function getStagedDiff(): Promise<GitDiff>;
//# sourceMappingURL=git.d.ts.map