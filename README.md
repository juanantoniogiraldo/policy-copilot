# Enterprise Policy Copilot MVP

## Overview

Decision-support system for compliance-heavy organizations. Provides policy-backed answers with strict refusal discipline when policy doesn't apply.

**This is NOT:**
- A chatbot
- A creative AI tool
- A policy authoring system

**This IS:**
- A decision-support system that finds correct, approved, policy-backed answers
- A system that refuses when policy doesn't apply
- A system that enforces authority boundaries and escalation rules

## Key Features

- **Zero Paid APIs**: Local BM25 retrieval (no OpenAI, no cloud services)
- **Two-Gate Confidence System**: MIN_SCORE (2.5) + RELATIVE_CONFIDENCE (1.8)
- **Template-Based Answer Generation**: No LLM calls, strict substring extraction
- **Answer Contract Enforcement**: 10 constitutional rules enforced
- **Refusal Discipline**: System refuses when policy doesn't apply
- **Conflict Surfacing**: Conflicts are surfaced, never resolved
- **Coverage States**: Covered, Conditional, Not Addressed

## Data Structure

- **All Policies**: `data/policies/policies_full.md` (7 policies separated by H1 headers)
- **Answer Contract**: `data/answer-contract/answer-contract.md` (10 constitutional rules)
- **Generated Index**: `data/policy-index.db` (created by ingestion script)

## Setup (Complete Beginners)

### Prerequisites

- Node.js 18+ installed
- No API keys needed
- No external services required

### Installation

1. Clone or extract repository

2. Navigate to project:
   ```bash
   cd policy-copilot-boars-head
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run ingestion to create policy index:
   ```bash
   npx tsx scripts/ingest.ts
   ```
   
   Expected output:
   ```
   Found 7 unique policy IDs
   Successfully parsed 7 policies with sections
   Ingestion complete:
     Policies: 7
     Chunks: 144
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

6. Open browser:
   ```
   http://localhost:3000 (or 3001 if 3000 is in use)
   ```

## Demo Flow

### Scenario 1: Covered Question
**Question:** "What do we do if allergen cross-contact is suspected?"

**Expected:**
- Green status (Covered)
- Clear actions from policy
- Authority: Food Safety Manager or Corporate QA
- Citations from FS-ALG-003 or FS-IR-001

### Scenario 2: Policy Gap
**Question:** "What is our weekend incident protocol?"

**Expected:**
- Red status (Not Addressed)
- Refusal message
- Identifies gap: no weekend policy exists
- Recommends escalation to Corporate QA

### Scenario 3: Conditional/Conflict
**Question:** "How long should we hold product with a sanitation deviation?"

**Expected:**
- Yellow status (Conditional)
- May surface conflict between OPS-PHR-002 and OPS-SAN-006
- Requires escalation for resolution

### Scenario 4: No Match
**Question:** "What is our social media crisis response plan?"

**Expected:**
- Red status (Not Addressed)
- Gate 1 failed (no relevant policy found)
- Clear refusal

## Architecture

```
[User Question] 
    ↓
[BM25 Retrieval Engine] → Searches 144 policy chunks
    ↓
[Two-Gate System]
    ├─ Gate 1: Min Score (2.5) → Absolute quality threshold
    └─ Gate 2: Relative Confidence (1.8x) → Ambiguity detection
    ↓
[Template Synthesis] → Extracts only policy text
    ↓
[Answer Contract Validator] → Enforces 10 rules
    ↓
[Structured Response] → UI displays all sections
```

## Two-Gate Confidence System

### Gate 1: Minimum Score (MIN_SCORE = 2.5)

**Purpose:** Filter completely irrelevant results

- BM25 scores are raw TF-IDF scores (not normalized 0-1)
- Typical range: 0-10+ (depends on document length)
- If `topScore < 2.5` → no policy applies → refuse immediately

### Gate 2: Relative Confidence (RELATIVE_CONFIDENCE = 1.8)

**Purpose:** Detect ambiguous queries where multiple policies match similarly

- Calculate: `confidenceRatio = topScore / avgNextScores`
- If `confidenceRatio < 1.8` → ambiguous → mark "Conditional"
- Forces escalation rather than overconfident answer

### Example Scenarios

**Strong Match (Both Gates Pass):**
```
Scores: [8.2, 3.1, 2.9, 2.7, 2.5]
topScore = 8.2 > 2.5 ✓ (Gate 1 pass)
avgNext = 2.8
ratio = 8.2 / 2.8 = 2.93 > 1.8 ✓ (Gate 2 pass)
Result: Covered
```

**Ambiguous Match (Gate 2 Fails):**
```
Scores: [5.1, 4.8, 4.5, 3.9, 3.7]
topScore = 5.1 > 2.5 ✓ (Gate 1 pass)
avgNext = 4.2
ratio = 5.1 / 4.2 = 1.21 < 1.8 ✗ (Gate 2 fail)
Result: Conditional
```

**No Match (Gate 1 Fails):**
```
Scores: [1.8, 1.2, 0.9, 0.7, 0.5]
topScore = 1.8 < 2.5 ✗ (Gate 1 fail)
Result: Not Addressed
```

## Answer Contract (10 Constitutional Rules)

See `data/answer-contract/answer-contract.md` for full details.

**Key Rules:**
1. Use only retrieved policy text
2. No external knowledge or "best practices"
3. Mandatory response structure (Summary, Actions, Authority, Citations, Coverage)
4. Explicit refusal if policy doesn't apply
5. Escalation only by role defined in policy
6. No opinions, empathy, recommendations
7. No synthesis beyond policy language
8. Conflicts surfaced, never resolved
9. Coverage states: Covered, Conditional, Not Addressed
10. All statements must be cited

## Project Structure

```
policy-copilot-boars-head/
├── data/
│   ├── policies/
│   │   └── policies_full.md          # 7 policies
│   ├── answer-contract/
│   │   └── answer-contract.md        # 10 rules
│   └── policy-index.db               # SQLite index (generated)
├── scripts/
│   └── ingest.ts                     # Policy ingestion
├── lib/
│   ├── config.ts                     # Constants (thresholds, paths)
│   ├── types.ts                      # TypeScript interfaces
│   ├── retrieval.ts                  # BM25 + two-gate system
│   ├── synthesis.ts                  # Template-based answers
│   └── validation.ts                 # Answer Contract validator
├── app/
│   ├── page.tsx                      # Main UI
│   ├── api/query/route.ts            # API endpoint
│   └── components/                   # UI components
├── package.json
└── README.md
```

## Configuration

Edit `lib/config.ts` to adjust system behavior:

```typescript
export const MIN_SCORE = 2.5;           // Adjust threshold
export const RELATIVE_CONFIDENCE = 1.8;  // Adjust confidence ratio
export const TOP_K_RESULTS = 5;          // Number of results to retrieve
```

## Troubleshooting

### "Retrieval not initialized"
- **Cause:** Database not created or API not initialized
- **Solution:** Run `npx tsx scripts/ingest.ts`

### "No chunks found in database"
- **Cause:** Policies file missing or malformed
- **Solution:** Verify `data/policies/policies_full.md` exists

### "All questions return Not Addressed"
- **Cause:** MIN_SCORE threshold too high for corpus
- **Solution:** Try lowering MIN_SCORE to 2.0 in `lib/config.ts`

### Port 3000 already in use
- **Solution:** Next.js will automatically use port 3001
- Or stop the process using port 3000

## Testing Checklist

- [ ] Covered question: passes both gates, shows green, has actions
- [ ] Conditional question: shows yellow, requires escalation
- [ ] Not addressed: shows red, clear refusal
- [ ] Unrelated question: fails Gate 1, refuses
- [ ] All responses have correct citations
- [ ] No forbidden phrases in responses
- [ ] Validator passes for all responses
- [ ] UI displays all sections correctly
- [ ] Gate scores displayed and accurate

## Next Steps (Post-MVP)

Future enhancements (not in current scope):

1. Real embeddings (OpenAI or local sentence-transformers)
2. LLM synthesis (GPT-4 or Ollama)
3. User authentication and role-based access
4. Audit logging for compliance
5. Policy version management
6. Production deployment (Docker, cloud hosting)
7. Analytics dashboard (refusal rates, gap analysis)
8. Multi-language support

## MVP Focus

**Local, Simple, Disciplined, Zero-Paid-APIs**

The system demonstrates restraint, not creativity.

## License

Internal use only - Enterprise Policy Copilot MVP

---

**Demo Ready**: Yes
**Production Ready**: No (MVP only)
**External APIs**: None
**Cost**: $0/month (local only)
