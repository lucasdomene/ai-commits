# AI Commits

Generate conventional commit messages using local LLM based on your staged changes.

## Quick Start

```bash
# Install
npm install -g ai-commits

# Stage your changes
git add .

# Generate and commit with confirmation
ai-commits

# Generate and commit immediately
ai-commits --auto

# Just generate message (no commit)
ai-commits --dry-run
```

## Requirements

- [Ollama](https://ollama.ai) installed and running
- Default model: `llama3.2:3b` (downloads automatically on first use)

```bash
# Install Ollama
brew install ollama

# Start Ollama service
ollama serve

# Pull default model (optional - happens automatically)
ollama pull llama3.2:3b
```

## How it works

1. Analyzes your `git diff --staged`
2. Detects commit type and scope automatically
3. Generates conventional commit message using local LLM
4. Follows format: `<type>(<scope>): <description>`

## Supported commit types

- `feat` - New features
- `fix` - Bug fixes  
- `refactor` - Code restructuring
- `perf` - Performance improvements
- `style` - Code style changes
- `test` - Test changes
- `docs` - Documentation
- `build` - Build system changes
- `ops` - Operational changes
- `chore` - Miscellaneous

## Configuration (optional)

Create `.ai-commits.json` in your project root:

```json
{
  "llm": {
    "model": "llama3.2:8b",
    "baseUrl": "http://localhost:11434"
  },
  "maxLength": 72
}
```

## Commands

- `ai-commits` - Generate with confirmation prompt
- `ai-commits --auto` - Generate and commit immediately  
- `ai-commits --dry-run` - Generate only (no commit)
- `ai-commits --help` - Show help 