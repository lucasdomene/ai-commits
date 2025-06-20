#!/usr/bin/env node

import { program } from 'commander';

program
  .name('ai-commits')
  .description('Generate conventional commit messages using local LLM based on your staged changes')
  .version('0.1.0');

// Default command - generate with confirmation
program
  .argument('[message]', 'optional commit message to override generated one')
  .option('-a, --auto', 'generate and commit immediately without confirmation')
  .option('-d, --dry-run', 'generate commit message only (do not commit)')
  .option('-c, --config <path>', 'path to config file', '.ai-commits.json')
  .option('-m, --model <model>', 'LLM model to use', 'llama3.2:3b')
  .option('--no-scope', 'disable automatic scope detection')
  .action(async (message, options) => {
    console.log('🤖 AI Commits CLI Framework Setup Complete!');
    console.log('\nReceived options:', options);
    
    if (message) {
      console.log('Custom message:', message);
    }
    
    if (options.auto) {
      console.log('Mode: Auto-commit (no confirmation)');
    } else if (options.dryRun) {
      console.log('Mode: Dry run (generate only)');
    } else {
      console.log('Mode: Generate with confirmation (default)');
    }
    
    console.log('\n✅ Ready for Phase 2: Git Integration');
  });

// Help command
program
  .command('help')
  .description('show detailed help and examples')
  .action(() => {
    console.log(`
🤖 AI Commits - Help

USAGE:
  ai-commits [options] [message]

EXAMPLES:
  ai-commits                    # Generate commit with confirmation
  ai-commits --auto             # Generate and commit immediately  
  ai-commits --dry-run          # Generate message only
  ai-commits -m llama3.2:8b     # Use specific model
  ai-commits --no-scope         # Disable scope detection

REQUIREMENTS:
  - Ollama installed and running
  - Staged git changes (git add ...)
  - Default model: llama3.2:3b

SETUP:
  brew install ollama
  ollama serve
  ollama pull llama3.2:3b
`);
  });

// Config command for future use
program
  .command('config')
  .description('show current configuration')
  .action(() => {
    console.log('📋 Configuration (placeholder for Phase 6)');
    console.log('Default model: llama3.2:3b');
    console.log('Config file: .ai-commits.json');
  });

program.parse(); 