"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitError = void 0;
exports.isGitRepository = isGitRepository;
exports.hasStagedChanges = hasStagedChanges;
exports.getStagedDiff = getStagedDiff;
exports.commitChanges = commitChanges;
exports.getGitStatus = getGitStatus;
const child_process_1 = require("child_process");
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
 * Execute git command and return output
 */
function execGitCommand(command) {
    try {
        return (0, child_process_1.execSync)(`git ${command}`, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe']
        }).toString();
    }
    catch (error) {
        throw new GitError(`Git command failed: ${error.message}`);
    }
}
/**
 * Check if we're in a git repository
 */
async function isGitRepository() {
    try {
        execGitCommand('rev-parse --git-dir');
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Check if there are staged changes
 */
async function hasStagedChanges() {
    try {
        const output = execGitCommand('diff --staged --name-only');
        return output.trim().length > 0;
    }
    catch {
        return false;
    }
}
/**
 * Get the diff of staged changes
 */
async function getStagedDiff() {
    try {
        // Get the diff with file stats
        const diffOutput = execGitCommand('diff --staged --numstat');
        const diffContent = execGitCommand('diff --staged');
        if (!diffOutput.trim()) {
            throw new GitError('No staged changes found');
        }
        const files = parseDiffOutput(diffOutput, diffContent);
        const summary = calculateSummary(files);
        return {
            files,
            summary
        };
    }
    catch (error) {
        if (error instanceof GitError) {
            throw error;
        }
        throw new GitError(`Failed to get staged diff: ${error}`);
    }
}
/**
 * Parse git diff --numstat output
 */
function parseDiffOutput(numstatOutput, diffContent) {
    const lines = numstatOutput.trim().split('\n');
    const files = [];
    for (const line of lines) {
        if (!line.trim())
            continue;
        const parts = line.split('\t');
        if (parts.length < 3)
            continue;
        const additions = parts[0] === '-' ? 0 : parseInt(parts[0], 10);
        const deletions = parts[1] === '-' ? 0 : parseInt(parts[1], 10);
        const path = parts[2];
        // Determine file status
        const status = determineFileStatus(path, diffContent);
        // Extract diff for this file
        const fileDiff = extractFileDiff(path, diffContent);
        files.push({
            path,
            status,
            additions: isNaN(additions) ? 0 : additions,
            deletions: isNaN(deletions) ? 0 : deletions,
            diff: fileDiff
        });
    }
    return files;
}
/**
 * Determine file status from diff content
 */
function determineFileStatus(path, diffContent) {
    // Look for file status indicators in diff
    if (diffContent.includes(`new file mode`) && diffContent.includes(path)) {
        return 'added';
    }
    if (diffContent.includes(`deleted file mode`) && diffContent.includes(path)) {
        return 'deleted';
    }
    if (diffContent.includes(`rename from`) && diffContent.includes(path)) {
        return 'renamed';
    }
    return 'modified';
}
/**
 * Extract diff content for a specific file
 */
function extractFileDiff(path, diffContent) {
    const lines = diffContent.split('\n');
    const fileDiffLines = [];
    let inFileSection = false;
    let currentFile = '';
    for (const line of lines) {
        if (line.startsWith('diff --git')) {
            // Start of a new file diff
            inFileSection = false;
            const match = line.match(/diff --git a\/(.+) b\/(.+)/);
            if (match) {
                currentFile = match[2]; // Use the "b/" path (destination)
                if (currentFile === path) {
                    inFileSection = true;
                    fileDiffLines.push(line);
                }
            }
        }
        else if (inFileSection) {
            fileDiffLines.push(line);
            // Stop when we hit the next file or end
            if (line.startsWith('diff --git') && !line.includes(path)) {
                break;
            }
        }
    }
    return fileDiffLines.join('\n');
}
/**
 * Calculate summary statistics
 */
function calculateSummary(files) {
    return {
        additions: files.reduce((sum, file) => sum + file.additions, 0),
        deletions: files.reduce((sum, file) => sum + file.deletions, 0),
        filesChanged: files.length
    };
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