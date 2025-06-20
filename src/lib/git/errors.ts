/**
 * Git Error Classes
 * Handles all Git-related error types and recovery hints
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