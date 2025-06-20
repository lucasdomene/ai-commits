export * from './types';
export * from './lib/git';
export * from './lib/llm';
export * from './lib/analyzer';
export * from './lib/config';
import { Config } from './types';
/**
 * Main AI Commits functionality
 * Phase 5: CLI Commands
 */
export declare class AICommits {
    private config;
    constructor(config?: Partial<Config>);
    /**
     * Generate commit message for staged changes
     */
    generateCommitMessage(): Promise<string>;
    /**
     * Generate and commit changes
     */
    autoCommit(): Promise<void>;
    /**
     * Generate commit message with user confirmation
     */
    interactiveCommit(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map