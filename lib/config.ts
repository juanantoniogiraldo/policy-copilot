// Zero-paid-API demo mode
export const DEMO_MODE = true;

// Data paths
export const POLICIES_PATH = './data/policies/policies_full.md';
export const ANSWER_CONTRACT_PATH = './data/answer-contract/answer-contract.md';
export const DB_PATH = './data/policy-index.db';

// BM25 Retrieval Configuration
// BM25 scores are raw TF-IDF scores (not 0-1 normalized)
export const MIN_SCORE = 2.5;  // Absolute minimum BM25 score to consider
export const RELATIVE_CONFIDENCE = 1.8;  // Top score must be this factor higher than avg of next 4
export const TOP_K_RESULTS = 5;  // Retrieve top 5 chunks for comparison

// Chunking Configuration
export const CHUNK_SIZE_MIN = 400;  // tokens
export const CHUNK_SIZE_MAX = 600;  // tokens

// Coverage States
export type CoverageStatus = "Covered" | "Conditional" | "Not Addressed";

