// Custom BM25 implementation for policy retrieval
// BM25 is a probabilistic ranking function used in information retrieval

export interface BM25Document {
  tokens: string[];
  length: number;
}

export class BM25 {
  private documents: BM25Document[];
  private docCount: number;
  private avgDocLength: number;
  private idfCache: Map<string, number>;
  private k1: number;
  private b: number;

  constructor(tokenizedDocs: string[][], k1: number = 1.5, b: number = 0.75) {
    this.k1 = k1;
    this.b = b;
    this.documents = tokenizedDocs.map(tokens => ({
      tokens,
      length: tokens.length,
    }));
    this.docCount = this.documents.length;
    this.avgDocLength = this.calculateAvgDocLength();
    this.idfCache = new Map();
    this.precomputeIDF();
  }

  private calculateAvgDocLength(): number {
    const totalLength = this.documents.reduce((sum, doc) => sum + doc.length, 0);
    return totalLength / this.docCount;
  }

  private precomputeIDF(): void {
    const termDocCount = new Map<string, number>();

    // Count how many documents contain each term
    for (const doc of this.documents) {
      const uniqueTerms = new Set(doc.tokens);
      for (const term of uniqueTerms) {
        termDocCount.set(term, (termDocCount.get(term) || 0) + 1);
      }
    }

    // Calculate IDF for each term
    for (const [term, docFreq] of termDocCount.entries()) {
      const idf = Math.log((this.docCount - docFreq + 0.5) / (docFreq + 0.5) + 1);
      this.idfCache.set(term, idf);
    }
  }

  private getIDF(term: string): number {
    return this.idfCache.get(term) || 0;
  }

  private getTermFrequency(term: string, doc: BM25Document): number {
    return doc.tokens.filter(t => t === term).length;
  }

  private calculateScore(queryTokens: string[], doc: BM25Document): number {
    let score = 0;

    for (const term of queryTokens) {
      const idf = this.getIDF(term);
      const tf = this.getTermFrequency(term, doc);

      if (tf === 0) continue;

      const numerator = tf * (this.k1 + 1);
      const denominator = tf + this.k1 * (1 - this.b + this.b * (doc.length / this.avgDocLength));
      
      score += idf * (numerator / denominator);
    }

    return score;
  }

  public search(queryTokens: string[]): number[] {
    return this.documents.map(doc => this.calculateScore(queryTokens, doc));
  }
}

