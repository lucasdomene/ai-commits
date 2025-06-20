// Main entry point for ai-commits
export * from './types';
export * from './lib/git';
export * from './lib/llm';
export * from './lib/analyzer';
export * from './lib/config';

import { CLIOptions, Config } from './types';
import { DEFAULT_CONFIG } from './lib/config';

/**
 * Main AI Commits functionality
 * Phase 5: CLI Commands
 */

export class AICommits {
  private config: Config;

  constructor(config: Partial<Config> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate commit message for staged changes
   */
  async generateCommitMessage(): Promise<string> {
    // TODO: Phase 5 - Implement main commit message generation flow
    throw new Error('Not implemented - Phase 5');
  }

  /**
   * Generate and commit changes
   */
  async autoCommit(): Promise<void> {
    // TODO: Phase 5 - Implement auto-commit functionality
    throw new Error('Not implemented - Phase 5');
  }

  /**
   * Generate commit message with user confirmation
   */
  async interactiveCommit(): Promise<void> {
    // TODO: Phase 5 - Implement interactive commit functionality
    throw new Error('Not implemented - Phase 5');
  }
} 