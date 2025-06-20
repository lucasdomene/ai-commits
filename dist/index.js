"use strict";
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
exports.AICommits = void 0;
// Main entry point for ai-commits
__exportStar(require("./types"), exports);
__exportStar(require("./lib/git"), exports);
__exportStar(require("./lib/llm"), exports);
__exportStar(require("./lib/analyzer"), exports);
__exportStar(require("./lib/config"), exports);
const config_1 = require("./lib/config");
/**
 * Main AI Commits functionality
 * Phase 5: CLI Commands
 */
class AICommits {
    constructor(config = {}) {
        this.config = { ...config_1.DEFAULT_CONFIG, ...config };
    }
    /**
     * Generate commit message for staged changes
     */
    async generateCommitMessage() {
        // TODO: Phase 5 - Implement main commit message generation flow
        throw new Error('Not implemented - Phase 5');
    }
    /**
     * Generate and commit changes
     */
    async autoCommit() {
        // TODO: Phase 5 - Implement auto-commit functionality
        throw new Error('Not implemented - Phase 5');
    }
    /**
     * Generate commit message with user confirmation
     */
    async interactiveCommit() {
        // TODO: Phase 5 - Implement interactive commit functionality
        throw new Error('Not implemented - Phase 5');
    }
}
exports.AICommits = AICommits;
//# sourceMappingURL=index.js.map