#!/usr/bin/env node

import { program } from 'commander';

program
  .name('ai-commits')
  .description('Generate conventional commit messages using local LLM')
  .version('0.1.0');

program
  .action(() => {
    console.log('🤖 AI Commits - TypeScript setup complete!');
    console.log('Ready for Phase 2: Git Integration');
  });

program.parse(); 