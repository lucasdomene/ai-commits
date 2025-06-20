"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitError = void 0;
exports.isGitRepository = isGitRepository;
exports.hasStagedChanges = hasStagedChanges;
exports.getStagedDiff = getStagedDiff;
exports.commitChanges = commitChanges;
exports.getGitStatus = getGitStatus;
/**
 * Git operations module
 * Phase 2: Git Integration
 */
class GitError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GitError';
    }
}
exports.GitError = GitError;
/**
 * Check if we're in a git repository
 */
async function isGitRepository() {
    // TODO: Phase 2 - Implement git repository detection
    throw new Error('Not implemented - Phase 2');
}
/**
 * Check if there are staged changes
 */
async function hasStagedChanges() {
    // TODO: Phase 2 - Implement staged changes detection
    throw new Error('Not implemented - Phase 2');
}
/**
 * Get the diff of staged changes
 */
async function getStagedDiff() {
    // TODO: Phase 2 - Implement git diff --staged parsing
    throw new Error('Not implemented - Phase 2');
}
/**
 * Commit changes with the given message
 */
async function commitChanges(message) {
    // TODO: Phase 2 - Implement git commit functionality
    throw new Error('Not implemented - Phase 2');
}
/**
 * Get git status information
 */
async function getGitStatus() {
    // TODO: Phase 2 - Implement git status parsing
    throw new Error('Not implemented - Phase 2');
}
//# sourceMappingURL=git.js.map