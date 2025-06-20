# AI Commits - Development Tasks

## Phase 1: Core Setup
- [x] Initialize TypeScript/Node.js project
- [x] Setup CLI framework (commander.js)
- [x] Create basic project structure
- [x] Setup build and dev scripts

## Phase 2: Git Integration
- [x] Implement git diff --staged parsing
- [x] Add git status validation (ensure staged changes exist)
- [x] Create git commit functionality
- [x] Add error handling for git operations

## Phase 3: LLM Integration
- [ ] Implement Ollama API client
- [ ] Create prompt template for commit message generation
- [ ] Add model availability checking
- [ ] Handle LLM response parsing and validation

## Phase 4: Diff Analysis
- [ ] Parse git diff output
- [ ] Implement basic scope detection (file paths)
- [ ] Add commit type detection logic
- [ ] Create change summary generation

## Phase 5: CLI Commands
- [ ] Implement default behavior (generate + confirm)
- [ ] Add --auto flag (immediate commit)
- [ ] Add --dry-run flag (generate only)
- [ ] Add --help and error messages

## Phase 6: Configuration
- [ ] Create config file loading (.ai-commits.json)
- [ ] Add default configuration
- [ ] Implement config validation
- [ ] Add config override options

## Phase 7: Polish & Distribution
- [ ] Add comprehensive error handling
- [ ] Create installation validation
- [ ] Write tests for core functions
- [ ] Prepare npm package for publishing

## Current Status
**Working on:** Phase 1 - Core Setup

## Notes
- Each phase should be fully functional before moving to next
- Test each phase with real git repos
- Keep commits small and focused per task 