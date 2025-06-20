#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
commander_1.program
    .name('ai-commits')
    .description('Generate conventional commit messages using local LLM')
    .version('0.1.0');
commander_1.program
    .action(() => {
    console.log('🤖 AI Commits - TypeScript setup complete!');
    console.log('Ready for Phase 2: Git Integration');
});
commander_1.program.parse();
//# sourceMappingURL=cli.js.map