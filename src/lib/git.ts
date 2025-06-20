import { GitDiff, GitFile } from '../types';
import { execSync } from 'child_process';

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
 * Execute git command and return output
 */
function execGitCommand(command: string): string {
  try {
    return execSync(`git ${command}`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).toString();
  } catch (error: any) {
    throw new GitError(`Git command failed: ${error.message}`);
  }
}

/**
 * Check if we're in a git repository
 */
export async function isGitRepository(): Promise<boolean> {
  try {
    execGitCommand('rev-parse --git-dir');
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if there are staged changes
 */
export async function hasStagedChanges(): Promise<boolean> {
  try {
    const output = execGitCommand('diff --staged --name-only');
    return output.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Validate git repository and staged changes
 */
export async function validateGitState(): Promise<void> {
  // Check if we're in a git repository
  if (!(await isGitRepository())) {
    throw new GitError('Not in a git repository. Please run this command from within a git repository.');
  }

  // Check if there are any staged changes
  if (!(await hasStagedChanges())) {
    const status = await getGitStatus();
    
    if (status.unstaged.length > 0) {
      throw new GitError(
        `No staged changes found. You have ${status.unstaged.length} unstaged file(s).\n` +
        'Please stage your changes first:\n' +
        '  git add <files>  # Stage specific files\n' +
        '  git add .        # Stage all changes'
      );
    }
    
    if (status.untracked.length > 0) {
      throw new GitError(
        `No staged changes found. You have ${status.untracked.length} untracked file(s).\n` +
        'Please stage your changes first:\n' +
        '  git add <files>  # Stage specific files\n' +
        '  git add .        # Stage all changes'
      );
    }
    
    throw new GitError(
      'No staged changes found. Please stage some changes before generating a commit message:\n' +
      '  git add <files>  # Stage specific files\n' +
      '  git add .        # Stage all changes'
    );
  }
}

/**
 * Validate commit message format
 */
export function validateCommitMessage(message: string): void {
  if (!message || !message.trim()) {
    throw new GitError('Commit message cannot be empty');
  }

  const trimmedMessage = message.trim();
  
  // Check minimum length
  if (trimmedMessage.length < 10) {
    throw new GitError('Commit message is too short (minimum 10 characters)');
  }

  // Check maximum length for first line
  const firstLine = trimmedMessage.split('\n')[0];
  if (firstLine.length > 100) {
    throw new GitError('Commit message first line is too long (maximum 100 characters)');
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
 * Commit changes with the given message
 */
export async function commitChanges(message: string): Promise<void> {
  try {
    // Validate git state first
    await validateGitState();
    
    // Validate commit message
    validateCommitMessage(message);
    
    // Execute git commit
    const output = execGitCommand(`commit -m "${message.replace(/"/g, '\\"')}"`);
    
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
      throw error;
    }
    throw new GitError(`Failed to commit changes: ${error}`);
  }
}

/**
 * Commit changes with a multi-line message (subject + body)
 */
export async function commitChangesWithBody(subject: string, body?: string): Promise<void> {
  try {
    // Validate git state first
    await validateGitState();
    
    // Construct full message
    const fullMessage = body ? `${subject}\n\n${body}` : subject;
    
    // Validate commit message
    validateCommitMessage(fullMessage);
    
    // Use git commit with -F flag for multi-line messages
    const tempFile = '/tmp/ai-commits-message.txt';
    require('fs').writeFileSync(tempFile, fullMessage);
    
    try {
      const output = execGitCommand(`commit -F "${tempFile}"`);
      
      // Clean up temp file
      require('fs').unlinkSync(tempFile);
      
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
      // Clean up temp file on error
      try {
        require('fs').unlinkSync(tempFile);
      } catch {}
      throw error;
    }
    
  } catch (error) {
    if (error instanceof GitError) {
      throw error;
    }
    throw new GitError(`Failed to commit changes: ${error}`);
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
 * Get the last commit information
 */
export async function getLastCommit(): Promise<{
  hash: string;
  subject: string;
  author: string;
  date: string;
}> {
  try {
    const output = execGitCommand('log -1 --pretty=format:"%H|%s|%an|%ad" --date=short');
    const parts = output.split('|');
    
    if (parts.length < 4) {
      throw new GitError('Unable to parse last commit information');
    }
    
    return {
      hash: parts[0],
      subject: parts[1],
      author: parts[2],
      date: parts[3]
    };
  } catch (error) {
    throw new GitError(`Failed to get last commit: ${error}`);
  }
}

/**
 * Check if there are any commits in the repository
 */
export async function hasCommits(): Promise<boolean> {
  try {
    execGitCommand('log -1 --oneline');
    return true;
  } catch {
    return false;
  }
}

/**
 * Get git status information
 */
export async function getGitStatus(): Promise<{
  staged: string[];
  unstaged: string[];
  untracked: string[];
}> {
  try {
    const output = execGitCommand('status --porcelain');
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
    throw new GitError(`Failed to get git status: ${error}`);
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
 * Get the diff of staged changes
 */
export async function getStagedDiff(): Promise<GitDiff> {
  // Validate git state before getting diff
  await validateGitState();
  
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
  } catch (error) {
    if (error instanceof GitError) {
      throw error;
    }
    throw new GitError(`Failed to get staged diff: ${error}`);
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