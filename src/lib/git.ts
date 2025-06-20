/**
 * Git operations module
 * Phase 2: Git Integration
 * 
 * This module has been refactored following SOLID principles:
 * - Single Responsibility: Each submodule has one clear purpose
 * - Open/Closed: Easy to extend with new git operations
 * - Liskov Substitution: Error classes can be substituted
 * - Interface Segregation: Focused interfaces for each concern
 * - Dependency Inversion: Depends on abstractions, not concretions
 */

// Re-export all functionality from the modular structure
export * from './git/index'; 