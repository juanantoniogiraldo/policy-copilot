import { CoverageStatus } from './config';

export interface PolicyMetadata {
  document_id: string;
  title: string;
  version?: string;
  effective_date?: string;
  department?: string;
}

export interface PolicyChunk {
  id: number;
  document_id: string;
  title: string;
  version: string;
  effective_date: string;
  section_number: string;
  section_title: string;
  content: string;
  token_count: number;
}

export interface RetrievalResult {
  chunk: PolicyChunk;
  score: number;  // Raw BM25 score
}

export interface ConfidenceGateResult {
  results: RetrievalResult[];
  passedMinScore: boolean;
  passedRelativeConfidence: boolean;
  topScore: number;
  avgNextScores: number;
}

export interface AnswerResponse {
  summary: string;
  required_actions: string[];
  authority_escalation: string;
  citations: Citation[];
  coverage: CoverageStatus;
  policy_gaps?: string;
  refusal_reason?: string;
}

export interface Citation {
  document_id: string;
  title: string;
  section: string;
  version: string;
  effective_date: string;
}

export interface QueryResponse {
  answer: AnswerResponse;
  sources: PolicyChunk[];
  scores: number[];
  gates: {
    passedMinScore: boolean;
    passedRelativeConfidence: boolean;
    topScore: number;
    avgNextScores: number;
  };
}

