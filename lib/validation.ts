import { AnswerResponse, ConfidenceGateResult } from './types';

export interface ValidationResult {
  valid: boolean;
  violations: string[];
  warnings: string[];
}

// Validate answer against Answer Contract rules
export function validateAnswer(
  answer: AnswerResponse,
  gateResult: ConfidenceGateResult
): ValidationResult {
  const violations: string[] = [];
  const warnings: string[] = [];
  
  // Rule 1: Citations must be present (unless refusal)
  if (answer.coverage !== "Not Addressed" && (!answer.citations || answer.citations.length === 0)) {
    violations.push("No citations provided for policy-based response");
  }
  
  // Rule 2: Coverage status must be valid
  if (!["Covered", "Conditional", "Not Addressed"].includes(answer.coverage)) {
    violations.push(`Invalid coverage status: ${answer.coverage}`);
  }
  
  // Rule 3: No forbidden phrases (external knowledge indicators)
  const forbiddenPhrases = [
    "best practice",
    "typically",
    "usually",
    "often",
    "it is advised",
    "you should consider",
    "based on experience",
    "i recommend",
    "probably",
    "common sense",
    "in most cases",
    "it would be advisable"
  ];
  
  const fullText = JSON.stringify(answer).toLowerCase();
  for (const phrase of forbiddenPhrases) {
    if (fullText.includes(phrase.toLowerCase())) {
      violations.push(`Forbidden phrase detected: "${phrase}" - indicates external knowledge`);
    }
  }
  
  // Rule 4: Refusal when Gate 1 failed
  if (!gateResult.passedMinScore && answer.coverage !== "Not Addressed") {
    violations.push("Must refuse (Not Addressed) when minimum score gate fails");
  }
  
  // Rule 5: Citations format check
  for (const citation of answer.citations) {
    if (!citation.document_id || !citation.section || !citation.version) {
      violations.push("Incomplete citation format - missing required fields");
      break;
    }
  }
  
  // Rule 6: No speculation markers (warnings only, as these can appear in quoted policy)
  const speculationMarkers = ["may", "might", "could", "possibly", "perhaps"];
  for (const marker of speculationMarkers) {
    const pattern = new RegExp(`\\b${marker}\\b`, 'gi');
    const matches = answer.summary.match(pattern);
    if (matches && matches.length > 3) {
      warnings.push(`High use of speculation marker "${marker}" - verify all statements come from policy`);
    }
  }
  
  // Rule 7: No conversational or empathetic language
  const conversationalPhrases = [
    "i understand",
    "i'm sorry",
    "unfortunately",
    "happy to help",
    "let me know",
    "feel free",
    "hope this helps"
  ];
  
  for (const phrase of conversationalPhrases) {
    if (fullText.includes(phrase.toLowerCase())) {
      violations.push(`Conversational phrase detected: "${phrase}" - system must be neutral and procedural`);
    }
  }
  
  // Rule 8: Required actions must not be empty (unless explicitly stated)
  if (!answer.required_actions || answer.required_actions.length === 0) {
    violations.push("Required actions field is empty - must either list actions or state 'No explicit actions specified in policy'");
  }
  
  // Rule 9: Authority escalation must be present
  if (!answer.authority_escalation || answer.authority_escalation.trim() === "") {
    violations.push("Authority/escalation field is empty - must be specified or state not available");
  }
  
  // Rule 10: Conditional/Not Addressed must have gap explanation
  if ((answer.coverage === "Conditional" || answer.coverage === "Not Addressed") && !answer.policy_gaps) {
    warnings.push(`${answer.coverage} status should include policy gaps explanation`);
  }
  
  return {
    valid: violations.length === 0,
    violations,
    warnings
  };
}

// Validate response structure (basic schema check)
export function validateResponseStructure(response: any): boolean {
  return (
    response &&
    typeof response.summary === 'string' &&
    Array.isArray(response.required_actions) &&
    typeof response.authority_escalation === 'string' &&
    Array.isArray(response.citations) &&
    typeof response.coverage === 'string'
  );
}

