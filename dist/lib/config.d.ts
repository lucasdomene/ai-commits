import { Config } from '../types';
/**
 * Configuration management module
 * Phase 6: Configuration
 */
/**
 * Default configuration
 */
export declare const DEFAULT_CONFIG: Config;
/**
 * Load configuration from file
 */
export declare function loadConfig(configPath: string): Promise<Config>;
/**
 * Merge user config with defaults
 */
export declare function mergeConfig(userConfig: Partial<Config>): Config;
/**
 * Validate configuration
 */
export declare function validateConfig(config: Config): void;
//# sourceMappingURL=config.d.ts.map