import { NextRequest, NextResponse } from 'next/server';
import { initializeRetrieval, retrievePolicyChunks } from '@/lib/retrieval';
import { synthesizeAnswer, detectConflicts } from '@/lib/synthesis';
import { validateAnswer } from '@/lib/validation';
import { QueryResponse } from '@/lib/types';

// Initialize retrieval on first request
let initialized = false;

export async function POST(request: NextRequest) {
  try {
    // Initialize retrieval engine if not already done
    if (!initialized) {
      await initializeRetrieval();
      initialized = true;
    }
    
    // Parse request body
    const body = await request.json();
    const { question } = body;
    
    // Validate input
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid question: must be a non-empty string' },
        { status: 400 }
      );
    }
    
    if (question.length > 500) {
      return NextResponse.json(
        { error: 'Question too long (max 500 characters)' },
        { status: 400 }
      );
    }
    
    // Retrieve policy chunks with confidence gates
    const gateResult = await retrievePolicyChunks(question);
    
    // Synthesize answer
    let answer = synthesizeAnswer(gateResult, question);
    
    // Check for conflicts if multiple policies retrieved
    if (gateResult.results.length > 1) {
      const conflict = detectConflicts(gateResult.results.map(r => r.chunk));
      if (conflict) {
        // Override with conflict response
        answer = {
          ...answer,
          summary: conflict,
          coverage: "Conditional",
          policy_gaps: conflict
        };
      }
    }
    
    // Validate answer against Answer Contract
    const validation = validateAnswer(answer, gateResult);
    
    if (!validation.valid) {
      console.error('Answer Contract violations:', validation.violations);
      return NextResponse.json(
        { 
          error: 'Answer Contract validation failed', 
          violations: validation.violations,
          warnings: validation.warnings
        },
        { status: 422 }
      );
    }
    
    // Log warnings but don't fail
    if (validation.warnings.length > 0) {
      console.warn('Answer Contract warnings:', validation.warnings);
    }
    
    // Prepare response
    const response: QueryResponse = {
      answer,
      sources: gateResult.results.map(r => r.chunk),
      scores: gateResult.results.map(r => r.score),
      gates: {
        passedMinScore: gateResult.passedMinScore,
        passedRelativeConfidence: gateResult.passedRelativeConfidence,
        topScore: gateResult.topScore,
        avgNextScores: gateResult.avgNextScores
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Query API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    initialized: initialized,
    message: 'Enterprise Policy Copilot API'
  });
}

