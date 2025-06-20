"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Re-export all functionality from the modular structure
__exportStar(require("./llm/index"), exports);
//# sourceMappingURL=llm.js.map