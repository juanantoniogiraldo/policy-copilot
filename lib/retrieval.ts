import Database from 'better-sqlite3';
import { MIN_SCORE, RELATIVE_CONFIDENCE, TOP_K_RESULTS, DB_PATH } from './config';
import { PolicyChunk, RetrievalResult, ConfidenceGateResult } from './types';
import { BM25 } from './bm25';

let bm25: BM25 | null = null;
let chunks: PolicyChunk[] = [];

// Simple tokenizer function
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2); // Filter out very short tokens
}

// Initialize: Load all chunks from SQLite and build BM25 index
export async function initializeRetrieval(): Promise<void> {
  const db = new Database(DB_PATH, { readonly: true });
  const rows = db.prepare('SELECT * FROM chunks').all() as PolicyChunk[];
  chunks = rows;
  
  // Tokenize all documents for BM25
  const tokenizedDocs = chunks.map(chunk => tokenize(chunk.content));
  
  // Build BM25 index with our custom implementation
  bm25 = new BM25(tokenizedDocs);
  
  db.close();
  console.log(`Retrieval initialized with ${chunks.length} chunks`);
}

// Query function with two-gate system
export async function retrievePolicyChunks(question: string): Promise<ConfidenceGateResult> {
  if (!bm25) {
    throw new Error('Retrieval not initialized. Call initializeRetrieval() first.');
  }
  
  // Tokenize question
  const tokens = tokenize(question);
  
  // Get BM25 scores for all chunks
  const scores = bm25.search(tokens);
  
  // Create results array with chunks and scores
  const results: RetrievalResult[] = scores
    .map((score: number, idx: number) => ({ chunk: chunks[idx], score }))
    .sort((a: RetrievalResult, b: RetrievalResult) => b.score - a.score)
    .slice(0, TOP_K_RESULTS);
  
  // Apply confidence gates
  return applyConfidenceGates(results);
}

// Apply two-gate confidence system
function applyConfidenceGates(results: RetrievalResult[]): ConfidenceGateResult {
  if (results.length === 0) {
    return {
      results: [],
      passedMinScore: false,
      passedRelativeConfidence: false,
      topScore: 0,
      avgNextScores: 0
    };
  }
  
  const topScore = results[0].score;
  
  // Gate 1: Minimum Score
  // If top score is below minimum threshold, no policy is relevant enough
  const passedMinScore = topScore >= MIN_SCORE;
  
  // Gate 2: Relative Confidence
  // Check if top result is significantly better than the next few results
  let passedRelativeConfidence = false;
  let avgNextScores = 0;
  
  if (results.length > 1) {
    // Calculate average of next 4 scores (or however many we have)
    const nextScores = results.slice(1, 5).map(r => r.score).filter(s => s > 0);
    
    if (nextScores.length > 0) {
      avgNextScores = nextScores.reduce((a, b) => a + b, 0) / nextScores.length;
      const confidenceRatio = topScore / avgNextScores;
      passedRelativeConfidence = confidenceRatio >= RELATIVE_CONFIDENCE;
    } else {
      // No other significant results - top result is clear winner
      passedRelativeConfidence = true;
    }
  } else {
    // Only one result - automatically pass Gate 2
    passedRelativeConfidence = true;
  }
  
  return {
    results,
    passedMinScore,
    passedRelativeConfidence,
    topScore,
    avgNextScores
  };
}

// Helper function to get chunks by document ID (for debugging)
export function getChunksByDocumentId(documentId: string): PolicyChunk[] {
  return chunks.filter(chunk => chunk.document_id === documentId);
}

