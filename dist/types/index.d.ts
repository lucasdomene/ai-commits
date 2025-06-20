export interface Config {
    llm: {
        provider: 'ollama' | 'openai-compatible';
        baseUrl: string;
        model: string;
    };
    commitFormat: {
        maxLength: number;
        includeBody: boolean;
    };
    scopeDetection: {
        enabled: boolean;
        rules: ScopeRule[];
    };
}
export interface ScopeRule {
    pattern: string;
    scope: string;
}
export interface GitDiff {
    files: GitFile[];
    summary: {
        additions: number;
        deletions: number;
        filesChanged: number;
    };
}
export interface GitFile {
    path: string;
    status: 'added' | 'modified' | 'deleted' | 'renamed';
    additions: number;
    deletions: number;
    diff: string;
}
export interface CommitMessage {
    type: CommitType;
    scope?: string;
    description: string;
    body?: string;
    footer?: string;
    raw: string;
}
export type CommitType = 'feat' | 'fix' | 'refactor' | 'perf' | 'style' | 'test' | 'docs' | 'build' | 'ops' | 'chore';
export interface LLMRequest {
    prompt: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
}
export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
    };
}
export interface CLIOptions {
    auto: boolean;
    dryRun: boolean;
    config: string;
    model: string;
    scope: boolean;
}
export interface DiffAnalysis {
    suggestedType: CommitType;
    suggestedScope?: string;
    fileTypes: string[];
    changesSummary: string;
}
//# sourceMappingURL=index.d.ts.map