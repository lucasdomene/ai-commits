import { execGitCommandSafe } from './command-executor';
import { validateGitState } from './repository';
import { GitError, GitCommitError } from './errors';

/**
 * Git Commit Operations
 * Handles commit validation, execution, and information retrieval
 */

export interface CommitInfo {
  hash: string;
  subject: string;
  author: string;
  date: string;
}

export interface CommitSummary {
  filesChanged: number;
  insertions: number;
  deletions: number;
}

/**
 * Validate commit message format
 */
export function validateCommitMessage(message: string): void {
  if (!message || !message.trim()) {
    throw new GitCommitError('Commit message cannot be empty');
  }

  const trimmedMessage = message.trim();
  
  // Check minimum length
  if (trimmedMessage.length < 10) {
    throw new GitCommitError('Commit message is too short (minimum 10 characters)');
  }

  // Check maximum length for first line
  const firstLine = trimmedMessage.split('\n')[0];
  if (firstLine.length > 100) {
    throw new GitCommitError('Commit message first line is too long (maximum 100 characters)');
  }

  // Check for conventional commit format (optional but recommended)
  const conventionalPattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .+/;
  if (!conventionalPattern.test(firstLine)) {
    console.warn('⚠️  Commit message does not follow conventional commit format');
    console.warn('   Recommended format: type(scope): description');
    console.warn('   Example: feat(auth): add user authentication');
  }
}

/**
 * Parse git commit output to extract summary information
 */
export function parseCommitOutput(output: string): CommitSummary {
  // Look for patterns like "1 file changed, 5 insertions(+), 2 deletions(-)"
  const summaryMatch = output.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/);
  
  if (summaryMatch) {
    return {
      filesChanged: parseInt(summaryMatch[1], 10) || 0,
      insertions: parseInt(summaryMatch[2], 10) || 0,
      deletions: parseInt(summaryMatch[3], 10) || 0
    };
  }
  
  return { filesChanged: 0, insertions: 0, deletions: 0 };
}

/**
 * Commit changes with enhanced error handling
 */
export async function commitChanges(message: string): Promise<void> {
  try {
    // Validate git state first
    await validateGitState();
    
    // Validate commit message
    validateCommitMessage(message);
    
    // Execute git commit with retry logic
    const output = await execGitCommandSafe(`commit -m "${message.replace(/"/g, '\\"')}"`, 2);
    
    // Parse commit output to get commit hash
    const commitMatch = output.match(/\[.+\s([a-f0-9]+)\]/);
    const commitHash = commitMatch ? commitMatch[1] : 'unknown';
    
    console.log(`✅ Commit successful: ${commitHash}`);
    
    // Show commit summary
    const summary = parseCommitOutput(output);
    if (summary.filesChanged > 0) {
      console.log(`📊 ${summary.filesChanged} file(s) changed, ${summary.insertions} insertion(s), ${summary.deletions} deletion(s)`);
    }
    
  } catch (error) {
    if (error instanceof GitError) {
      // Re-throw git errors with recovery hints
      if (error.recoveryHint) {
        console.error(`\n💡 Recovery suggestion:\n${error.recoveryHint}`);
      }
      throw error;
    }
    
    // Wrap unexpected errors
    throw new GitCommitError(`Failed to commit changes: ${(error as Error).message}`, (error as Error).message);
  }
}

/**
 * Commit changes with a multi-line message (subject + body) with enhanced error handling
 */
export async function commitChangesWithBody(subject: string, body?: string): Promise<void> {
  let tempFile: string | null = null;
  
  try {
    // Validate git state first
    await validateGitState();
    
    // Construct full message
    const fullMessage = body ? `${subject}\n\n${body}` : subject;
    
    // Validate commit message
    validateCommitMessage(fullMessage);
    
    // Use git commit with -F flag for multi-line messages
    tempFile = `/tmp/ai-commits-message-${Date.now()}.txt`;
    require('fs').writeFileSync(tempFile, fullMessage);
    
    const output = await execGitCommandSafe(`commit -F "${tempFile}"`, 2);
    
    // Parse commit output
    const commitMatch = output.match(/\[.+\s([a-f0-9]+)\]/);
    const commitHash = commitMatch ? commitMatch[1] : 'unknown';
    
    console.log(`✅ Commit successful: ${commitHash}`);
    
    // Show commit summary
    const summary = parseCommitOutput(output);
    if (summary.filesChanged > 0) {
      console.log(`📊 ${summary.filesChanged} file(s) changed, ${summary.insertions} insertion(s), ${summary.deletions} deletion(s)`);
    }
    
  } catch (error) {
    if (error instanceof GitError) {
      // Re-throw git errors with recovery hints
      if (error.recoveryHint) {
        console.error(`\n💡 Recovery suggestion:\n${error.recoveryHint}`);
      }
      throw error;
    }
    
    // Wrap unexpected errors
    throw new GitCommitError(`Failed to commit changes: ${(error as Error).message}`, (error as Error).message);
  } finally {
    // Clean up temp file
    if (tempFile) {
      try {
        require('fs').unlinkSync(tempFile);
      } catch (cleanupError) {
        console.warn(`⚠️  Warning: Could not clean up temporary file ${tempFile}`);
      }
    }
  }
}

/**
 * Get the last commit information with error handling
 */
export async function getLastCommit(): Promise<CommitInfo> {
  try {
    const output = await execGitCommandSafe('log -1 --pretty=format:"%H|%s|%an|%ad" --date=short');
    const parts = output.split('|');
    
    if (parts.length < 4) {
      throw new GitError('Unable to parse last commit information', 'PARSE_ERROR');
    }
    
    return {
      hash: parts[0],
      subject: parts[1],
      author: parts[2],
      date: parts[3]
    };
  } catch (error) {
    if (error instanceof GitError) {
      throw error;
    }
    throw new GitError(`Failed to get last commit: ${(error as Error).message}`, 'COMMIT_INFO_FAILED');
  }
} 