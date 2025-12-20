import { ConfidenceGateResult, AnswerResponse, Citation, PolicyChunk } from './types';
import { CoverageStatus } from './config';

// Generate Answer Contract-compliant response using only retrieved policy text
export function synthesizeAnswer(
  gateResult: ConfidenceGateResult,
  question: string
): AnswerResponse {
  // If Gate 1 failed, return refusal immediately
  if (!gateResult.passedMinScore) {
    return createRefusalResponse(
      "This scenario is not addressed in current approved policies. The system cannot provide guidance beyond documented procedures."
    );
  }
  
  const topChunk = gateResult.results[0].chunk;
  const topChunks = gateResult.results.slice(0, 3).map(r => r.chunk);  // Use top 3 for synthesis
  
  // Extract components from policy text
  const summary = extractSummary(topChunk);
  const actions = extractActions(topChunks);
  const authority = extractAuthority(topChunks);
  const citations = generateCitations(topChunks);
  const coverage = determineCoverage(gateResult, actions);
  const gaps = determineGaps(gateResult, coverage, question);
  
  return {
    summary,
    required_actions: actions,
    authority_escalation: authority,
    citations,
    coverage,
    policy_gaps: gaps
  };
}

// Create refusal response
function createRefusalResponse(reason: string): AnswerResponse {
  return {
    summary: reason,
    required_actions: ["Escalate to Corporate QA for determination."],
    authority_escalation: "Recommended escalation based on policy authority limits: Corporate QA, Legal & Compliance (if applicable)",
    citations: [],
    coverage: "Not Addressed",
    refusal_reason: reason
  };
}

// Extract summary from top chunk (first 2-3 sentences)
function extractSummary(chunk: PolicyChunk): string {
  // Split by sentence boundaries and filter out very short fragments
  const sentences = chunk.content
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);
  
  // Take first 2-3 sentences, up to 300 characters
  let summary = '';
  for (let i = 0; i < Math.min(3, sentences.length); i++) {
    const sentence = sentences[i];
    if ((summary + sentence).length > 300) break;
    summary += sentence + '. ';
  }
  
  return summary.trim() || chunk.content.substring(0, 200) + '...';
}

// Extract required actions from policy text
function extractActions(chunks: PolicyChunk[]): string[] {
  const actions: string[] = [];
  
  for (const chunk of chunks) {
    const lines = chunk.content.split('\n').map(l => l.trim());
    
    for (const line of lines) {
      // Look for numbered lists, bullet points, or imperative statements
      if (
        /^\d+\.\s+/.test(line) ||  // Numbered list
        /^[-●•]\s+/.test(line) ||   // Bullet point
        /^(Must|Shall|Should|Contact|Report|Notify|Hold|Release|Place|Stop|Perform|Escalate|Initiate)/i.test(line)  // Action verbs
      ) {
        // Clean up and add if not too short
        const cleaned = line.replace(/^[-●•\d]+\.?\s*/, '').trim();
        if (cleaned.length > 10 && !actions.includes(cleaned)) {
          actions.push(cleaned);
        }
      }
    }
  }
  
  // If no explicit actions found, state that clearly
  if (actions.length === 0) {
    return ["No explicit actions specified in policy."];
  }
  
  // Limit to top 10 most relevant actions
  return actions.slice(0, 10);
}

// Extract authority and escalation information
function extractAuthority(chunks: PolicyChunk[]): string {
  // Look for role mentions and escalation keywords
  const rolePatterns = [
    /Food Safety Manager/gi,
    /QA Manager/gi,
    /Corporate QA/gi,
    /QA Director/gi,
    /Plant Manager/gi,
    /Production Supervisor/gi,
    /Operations Manager/gi,
    /Supplier Quality/gi,
    /Legal\/Compliance/gi,
    /Legal & Compliance/gi,
    /Corporate Communications/gi,
    /General Counsel/gi
  ];
  
  const rolesFound = new Set<string>();
  
  for (const chunk of chunks) {
    for (const pattern of rolePatterns) {
      const matches = chunk.content.match(pattern);
      if (matches) {
        matches.forEach(match => rolesFound.add(match));
      }
    }
  }
  
  if (rolesFound.size > 0) {
    const roles = Array.from(rolesFound);
    return `Escalate to: ${roles.join(', ')}`;
  }
  
  return "Escalation authority not specified in retrieved policy.";
}

// Generate citations from chunks
function generateCitations(chunks: PolicyChunk[]): Citation[] {
  return chunks.map(chunk => ({
    document_id: chunk.document_id,
    title: chunk.title,
    section: chunk.section_number,
    version: chunk.version || "Not specified",
    effective_date: chunk.effective_date || "Not specified"
  }));
}

// Determine coverage status based on gates and actions
function determineCoverage(gateResult: ConfidenceGateResult, actions: string[]): CoverageStatus {
  // Not Addressed: Failed Gate 1
  if (!gateResult.passedMinScore) {
    return "Not Addressed";
  }
  
  // Conditional: Passed Gate 1 but failed Gate 2, OR no explicit actions found
  if (!gateResult.passedRelativeConfidence || actions[0] === "No explicit actions specified in policy.") {
    return "Conditional";
  }
  
  // Covered: Passed both gates AND explicit actions found
  return "Covered";
}

// Determine policy gaps for conditional/not addressed cases
function determineGaps(
  gateResult: ConfidenceGateResult,
  coverage: CoverageStatus,
  question: string
): string | undefined {
  if (coverage === "Not Addressed") {
    return "No applicable policy found for this scenario. This may indicate a policy gap that requires escalation.";
  }
  
  if (coverage === "Conditional") {
    if (!gateResult.passedRelativeConfidence) {
      return "Multiple policies may apply with similar relevance. Manual review required to determine correct policy application.";
    }
    return "Policy provides partial guidance but lacks explicit procedures for this specific scenario. QA determination required.";
  }
  
  return undefined;
}

// Detect conflicts between policies
export function detectConflicts(chunks: PolicyChunk[]): string | null {
  // Look for conflicting guidance (e.g., different hold times, different authorities)
  // This is a simplified implementation - could be enhanced with more sophisticated logic
  
  const holdTimes = new Set<string>();
  const authorities = new Set<string>();
  
  for (const chunk of chunks) {
    // Look for hold time mentions
    const holdMatches = chunk.content.match(/(\d+)\s*(hour|day|week)s?\s*hold/gi);
    if (holdMatches) {
      holdMatches.forEach(match => holdTimes.add(match.toLowerCase()));
    }
    
    // Look for different approval authorities
    const approvalMatches = chunk.content.match(/(Plant|Corporate)\s*(QA|Manager)\s*approval/gi);
    if (approvalMatches) {
      approvalMatches.forEach(match => authorities.add(match.toLowerCase()));
    }
  }
  
  if (holdTimes.size > 1) {
    return `Relevant policies contain overlapping or conflicting guidance regarding hold times: ${Array.from(holdTimes).join(', ')}. Resolution is outside the authority of this system. Escalation is required.`;
  }
  
  if (authorities.size > 1) {
    return `Relevant policies contain overlapping or conflicting guidance regarding approval authority: ${Array.from(authorities).join(', ')}. Resolution is outside the authority of this system. Escalation is required.`;
  }
  
  return null;
}

