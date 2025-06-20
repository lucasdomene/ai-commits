import { GitDiff, GitFile } from '../../types';
import { execGitCommandSafe } from './command-executor';
import { validateGitState } from './repository';
import { GitError, GitStagingError } from './errors';

/**
 * Git Diff Operations
 * Handles diff retrieval, parsing, and analysis
 */

/**
 * Get the diff of staged changes with error handling
 */
export async function getStagedDiff(): Promise<GitDiff> {
  // Validate git state before getting diff
  await validateGitState();
  
  try {
    // Get the diff with file stats
    const diffOutput = await execGitCommandSafe('diff --staged --numstat');
    const diffContent = await execGitCommandSafe('diff --staged');
    
    if (!diffOutput.trim()) {
      throw new GitStagingError('No staged changes found');
    }

    const files = parseDiffOutput(diffOutput, diffContent);
    const summary = calculateSummary(files);

    return {
      files,
      summary
    };
  } catch (error) {
    if (error instanceof GitError) {
      throw error;
    }
    throw new GitError(`Failed to get staged diff: ${(error as Error).message}`, 'DIFF_FAILED');
  }
}

/**
 * Parse git diff --numstat output
 */
function parseDiffOutput(numstatOutput: string, diffContent: string): GitFile[] {
  const lines = numstatOutput.trim().split('\n');
  const files: GitFile[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.split('\t');
    if (parts.length < 3) continue;

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
function determineFileStatus(path: string, diffContent: string): GitFile['status'] {
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
function extractFileDiff(path: string, diffContent: string): string {
  const lines = diffContent.split('\n');
  const fileDiffLines: string[] = [];
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
    } else if (inFileSection) {
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
function calculateSummary(files: GitFile[]): GitDiff['summary'] {
  return {
    additions: files.reduce((sum, file) => sum + file.additions, 0),
    deletions: files.reduce((sum, file) => sum + file.deletions, 0),
    filesChanged: files.length
  };
} 