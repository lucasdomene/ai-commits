// Main Git module - exports all functionality
export * from './errors';
export * from './command-executor';
export * from './repository';
export * from './status';
export * from './commit';
export * from './diff';

/**
 * Main Git Service
 * High-level interface for git operations following SOLID principles:
 * 
 * - Single Responsibility: Each submodule has one clear purpose
 * - Open/Closed: Easy to extend with new git operations
 * - Liskov Substitution: Error classes can be substituted
 * - Interface Segregation: Focused interfaces for each concern
 * - Dependency Inversion: Depends on abstractions, not concretions
 */ 