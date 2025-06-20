import { LLMError } from './errors';
import { DiffAnalysis } from '../../types';

/**
 * Prompt Building and Response Parsing
 * Handles commit message prompt creation and LLM response validation
 */

export interface ParsedCommitMessage {
  type: string;
  scope?: string;
  description: string;
  body?: string;
}

/**
 * Create prompt template for commit message generation
 */
export function createCommitPrompt(
  diff: string,
  analysis: Partial<DiffAnalysis>
): string {
  const prompt = `You are an expert developer assistant that generates conventional commit messages.

TASK: Generate a conventional commit message based on the git diff provided.

CONVENTIONAL COMMIT FORMAT:
<type>(<scope>): <description>

VALID TYPES:
- feat: New features
- fix: Bug fixes
- refactor: Code restructuring without behavior change
- perf: Performance improvements
- style: Code style changes (formatting, etc.)
- test: Test changes
- docs: Documentation changes
- build: Build system changes
- ops: Operational changes
- chore: Miscellaneous changes

RULES:
1. Use lowercase for type and scope
2. Keep description under 72 characters
3. Use imperative mood ("add" not "added")
4. No period at the end of description
5. Be specific and concise
6. Focus on WHAT changed, not HOW

ANALYSIS:
${analysis.suggestedType ? `Suggested type: ${analysis.suggestedType}` : ''}
${analysis.suggestedScope ? `Suggested scope: ${analysis.suggestedScope}` : ''}
${analysis.fileTypes ? `File types: ${analysis.fileTypes.join(', ')}` : ''}
${analysis.changesSummary ? `Summary: ${analysis.changesSummary}` : ''}

GIT DIFF:
\`\`\`
${diff}
\`\`\`

Generate ONLY the commit message in the format: <type>(<scope>): <description>
If no scope is appropriate, use: <type>: <description>

COMMIT MESSAGE:`;

  return prompt;
}

/**
 * Parse and validate LLM response
 */
export function parseCommitMessageResponse(response: string): ParsedCommitMessage {
  // Clean up the response
  const cleaned = response.trim().replace(/^COMMIT MESSAGE:\s*/i, '');
  
  // Extract the first line (should be the commit message)
  const lines = cleaned.split('\n');
  const commitLine = lines[0].trim();
  
  // Parse conventional commit format
  const conventionalPattern = /^(feat|fix|docs|style|refactor|perf|test|build|ops|chore)(\(([^)]+)\))?: (.+)$/;
  const match = commitLine.match(conventionalPattern);
  
  if (!match) {
    throw new LLMError('Generated message does not follow conventional commit format', 'INVALID_FORMAT');
  }
  
  const [, type, , scope, description] = match;
  
  // Validate description length
  if (description.length > 72) {
    throw new LLMError('Generated description is too long (max 72 characters)', 'DESCRIPTION_TOO_LONG');
  }
  
  // Extract body if present
  const body = lines.slice(1).join('\n').trim() || undefined;
  
  return {
    type,
    scope,
    description,
    body
  };
} 