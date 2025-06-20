import { GitDiff, GitFile } from '../types';
import { execSync } from 'child_process';

/**
 * Git operations module
 * Phase 2: Git Integration
 */

export class GitError extends Error {
  constructor(message: string, public code?: string, public recoveryHint?: string) {
    super(message);
    this.name = 'GitError';
  }
}

export class GitRepositoryError extends GitError {
  constructor(message: string) {
    super(
      message,
      'NOT_A_REPOSITORY',
      'Make sure you are running this command from within a git repository. Use "git init" to initialize a new repository.'
    );
  }
}

export class GitStagingError extends GitError {
  constructor(message: string, unstagedCount: number = 0, untrackedCount: number = 0) {
    const hints = [];
    if (unstagedCount > 0) {
      hints.push(`Stage ${unstagedCount} unstaged file(s): git add <files>`);
    }
    if (untrackedCount > 0) {
      hints.push(`Stage ${untrackedCount} untracked file(s): git add <files>`);
    }
    if (hints.length === 0) {
      hints.push('Make some changes and stage them: git add <files>');
    }
    
    super(
      message,
      'NO_STAGED_CHANGES',
      hints.join('\n')
    );
  }
}

export class GitCommitError extends GitError {
  constructor(message: string, originalError?: string) {
    let recoveryHint = 'Check your git configuration and try again.';
    
    if (originalError?.includes('Please tell me who you are')) {
      recoveryHint = 'Configure your git identity:\n' +
        '  git config --global user.name "Your Name"\n' +
        '  git config --global user.email "your.email@example.com"';
    } else if (originalError?.includes('nothing to commit')) {
      recoveryHint = 'Stage some changes before committing:\n' +
        '  git add <files>  # Stage specific files\n' +
        '  git add .        # Stage all changes';
    } else if (originalError?.includes('pathspec') && originalError?.includes('did not match')) {
      recoveryHint = 'Check that the files you\'re trying to add exist and try again.';
    }
    
    super(message, 'COMMIT_FAILED', recoveryHint);
  }
}

export class GitCommandError extends GitError {
  constructor(command: string, originalError: string, exitCode?: number) {
    const message = `Git command failed: ${command}`;
    let recoveryHint = 'Check the command and try again.';
    
    // Provide specific hints based on common git errors
    if (originalError.includes('not a git repository')) {
      recoveryHint = 'Initialize a git repository with "git init" or navigate to an existing repository.';
    } else if (originalError.includes('Permission denied')) {
      recoveryHint = 'Check file permissions and ensure you have write access to the repository.';
    } else if (originalError.includes('fatal: not a valid object name')) {
      recoveryHint = 'The repository may be empty or corrupted. Try making an initial commit.';
    } else if (originalError.includes('index.lock')) {
      recoveryHint = 'Another git process may be running. Wait for it to finish or remove .git/index.lock if stuck.';
    }
    
    super(message, 'COMMAND_FAILED', recoveryHint);
  }
}

/**
 * Execute git command with enhanced error handling
 */
function execGitCommand(command: string): string {
  try {
    return execSync(`git ${command}`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).toString();
  } catch (error: any) {
    const errorMessage = error.stderr || error.message || 'Unknown git error';
    const exitCode = error.status;
    
    // Handle specific git errors with better messages
    if (errorMessage.includes('not a git repository')) {
      throw new GitRepositoryError('Not in a git repository');
    }
    
    throw new GitCommandError(command, errorMessage, exitCode);
  }
}

/**
 * Execute git command with timeout and retry logic
 */
async function execGitCommandSafe(command: string, retries: number = 1): Promise<string> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return execGitCommand(command);
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry certain errors
      if (error instanceof GitRepositoryError || 
          error instanceof GitStagingError ||
          (error as any).code === 'NOT_A_REPOSITORY') {
        throw error;
      }
      
      // Only retry on transient errors
      const errorMessage = (error as any).message || '';
      if (errorMessage.includes('index.lock') && attempt < retries) {
        console.warn(`⚠️  Git operation failed (attempt ${attempt}/${retries}), retrying...`);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError!;
}

/**
 * Check if we're in a git repository
 */
export async function isGitRepository(): Promise<boolean> {
  try {
    await execGitCommandSafe('rev-parse --git-dir');
    return true;
  } catch (error) {
    if (error instanceof GitRepositoryError) {
      return false;
    }
    // For other errors, still return false but log the issue
    console.warn('⚠️  Error checking git repository status:', (error as Error).message);
    return false;
  }
}

/**
 * Check if there are staged changes
 */
export async function hasStagedChanges(): Promise<boolean> {
  try {
    const output = await execGitCommandSafe('diff --staged --name-only');
    return output.trim().length > 0;
  } catch (error) {
    if (error instanceof GitRepositoryError) {
      throw error;
    }
    console.warn('⚠️  Error checking staged changes:', (error as Error).message);
    return false;
  }
}

/**
 * Validate git repository and staged changes with enhanced error handling
 */
export async function validateGitState(): Promise<void> {
  // Check if we're in a git repository
  if (!(await isGitRepository())) {
    throw new GitRepositoryError('Not in a git repository. Please run this command from within a git repository.');
  }

  // Check if there are any staged changes
  if (!(await hasStagedChanges())) {
    try {
      const status = await getGitStatus();
      throw new GitStagingError(
        'No staged changes found',
        status.unstaged.length,
        status.untracked.length
      );
    } catch (error) {
      if (error instanceof GitStagingError) {
        throw error;
      }
      // If we can't get status, provide a generic staging error
      throw new GitStagingError('No staged changes found. Please stage some changes before proceeding.');
    }
  }
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
 * Parse git commit output to extract summary information
 */
function parseCommitOutput(output: string): {
  filesChanged: number;
  insertions: number;
  deletions: number;
} {
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
 * Get the last commit information with error handling
 */
export async function getLastCommit(): Promise<{
  hash: string;
  subject: string;
  author: string;
  date: string;
}> {
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

/**
 * Check if there are any commits in the repository
 */
export async function hasCommits(): Promise<boolean> {
  try {
    await execGitCommandSafe('log -1 --oneline');
    return true;
  } catch (error) {
    // If the error is about no commits, return false
    const errorMessage = (error as any).message || '';
    if (errorMessage.includes('does not have any commits yet') || 
        errorMessage.includes('bad default revision') ||
        errorMessage.includes('ambiguous argument \'HEAD\'')) {
      return false;
    }
    
    // For other errors, still return false but log
    console.warn('⚠️  Error checking commit history:', errorMessage);
    return false;
  }
}

/**
 * Get git status information with error handling
 */
export async function getGitStatus(): Promise<{
  staged: string[];
  unstaged: string[];
  untracked: string[];
}> {
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
export async function getDetailedGitStatus(): Promise<{
  staged: { count: number; files: string[] };
  unstaged: { count: number; files: string[] };
  untracked: { count: number; files: string[] };
  summary: string;
}> {
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