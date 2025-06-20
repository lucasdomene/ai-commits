import { GitDiff, DiffAnalysis, CommitType } from '../types';
/**
 * Diff analysis module
 * Phase 4: Diff Analysis
 */
/**
 * Analyze git diff to suggest commit type and scope
 */
export declare function analyzeDiff(diff: GitDiff): DiffAnalysis;
/**
 * Detect commit type based on file changes
 */
export declare function detectCommitType(diff: GitDiff): CommitType;
/**
 * Detect scope based on file paths
 */
export declare function detectScope(diff: GitDiff): string | undefined;
/**
 * Generate a summary of changes
 */
export declare function generateChangesSummary(diff: GitDiff): string;
/**
 * Get file types from diff
 */
export declare function getFileTypes(diff: GitDiff): string[];
//# sourceMappingURL=analyzer.d.ts.map