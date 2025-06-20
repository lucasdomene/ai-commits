/**
 * LLM integration module
 * Phase 3: LLM Integration
 * 
 * This module has been refactored following SOLID principles:
 * - Single Responsibility: Each submodule has one clear purpose
 * - Open/Closed: Easy to extend with new LLM providers
 * - Liskov Substitution: Error classes can be substituted
 * - Interface Segregation: Focused interfaces for each concern
 * - Dependency Inversion: Depends on abstractions, not concretions
 */

// Re-export all functionality from the modular structure
export * from './llm/index'; 