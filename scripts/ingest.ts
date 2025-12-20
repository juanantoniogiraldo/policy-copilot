import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';
import { POLICIES_PATH, DB_PATH, CHUNK_SIZE_MIN, CHUNK_SIZE_MAX } from '../lib/config';
import { PolicyMetadata } from '../lib/types';

interface PolicySection {
  metadata: PolicyMetadata;
  sections: {
    section_number: string;
    section_title: string;
    content: string;
    token_count: number;
  }[];
}

// Normalize the unusual file format where each word is on a separate line
function normalizeContent(content: string): string {
  // The file has format where each word ends with " \n" (space + newline)
  // Replace newlines that follow spaces with just spaces
  let normalized = content.replace(/\n /g, ' ').replace(/\n{3,}/g, '\n\n');
  return normalized;
}

// Parse policies file and split by policy IDs
function parsePoliciesFile(filePath: string): PolicySection[] {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const content = normalizeContent(rawContent);
  
  // Find all policy IDs (e.g., FS-IR-001, OPS-PHR-002, etc.)
  const policyIdRegex = /\b([A-Z]+-[A-Z]+-\d+)\b/g;
  
  const policies: PolicySection[] = [];
  const policyStarts: Array<{ id: string; index: number }> = [];
  
  let match;
  const seenIds = new Set<string>();
  
  // Find unique policy IDs and their first occurrence
  while ((match = policyIdRegex.exec(content)) !== null) {
    const id = match[1];
    if (!seenIds.has(id)) {
      seenIds.add(id);
      policyStarts.push({ id, index: match.index });
    }
  }
  
  console.log(`Found ${policyStarts.length} unique policy IDs`);
  
  // Extract content for each policy
  for (let i = 0; i < policyStarts.length; i++) {
    const current = policyStarts[i];
    const nextIndex = i < policyStarts.length - 1 ? policyStarts[i + 1].index : content.length;
    const policyContent = content.substring(current.index, nextIndex);
    
    // Extract title (usually follows the policy ID)
    const lines = policyContent.split('\n').filter(l => l.trim());
    let title = current.id; // Default to ID if no title found
    
    // Look for a title in the first few lines after the ID
    for (let j = 0; j < Math.min(5, lines.length); j++) {
      const line = lines[j];
      // Skip lines that are just the ID, or metadata markers
      if (line.includes(current.id) || line.match(/^(Doc ID|Version|Effective|Supersedes|Owner|Approved|Scope):/)) {
        continue;
      }
      // If line looks like a title (not too short, contains letters)
      if (line.length > 10 && line.match(/[A-Za-z]{3,}/)) {
        title = line.replace(/^—\s*/, '').trim();
        break;
      }
    }
    
    // Extract metadata
    const metadata = extractMetadata(policyContent, current.id, title);
    
    // Extract sections
    const sections = extractSections(policyContent, metadata);
    
    if (sections.length > 0) {
      policies.push({ metadata, sections });
    }
  }
  
  console.log(`Successfully parsed ${policies.length} policies with sections`);
  return policies;
}

// Extract metadata from policy text
function extractMetadata(content: string, documentId: string, title: string): PolicyMetadata {
  const versionMatch = content.match(/Version:\s*([^\n]+)/i);
  const dateMatch = content.match(/Effective\s+Date:\s*([^\n]+)/i);
  const deptMatch = content.match(/(?:Owner|Department):\s*([^\n]+)/i);
  
  return {
    document_id: documentId,
    title: title,
    version: versionMatch ? versionMatch[1].trim() : 'Not specified',
    effective_date: dateMatch ? dateMatch[1].trim() : 'Not specified',
    department: deptMatch ? deptMatch[1].trim() : undefined
  };
}

// Extract sections from policy content
function extractSections(content: string, metadata: PolicyMetadata) {
  const sections: Array<{
    section_number: string;
    section_title: string;
    content: string;
    token_count: number;
  }> = [];
  
  // Match numbered sections using regex on the whole content
  // Look for patterns like "1. Title" or "1.1 Title" followed by content
  const sectionRegex = /(\d+(?:\.\d+)?)\s*\n?([A-Z][^\n]+)/g;
  
  let match;
  const sectionStarts: Array<{ number: string; title: string; index: number }> = [];
  
  while ((match = sectionRegex.exec(content)) !== null) {
    // Only match top-level or second-level sections (not 1.1.1 for now)
    const number = match[1];
    if (number.split('.').length <= 2) {
      sectionStarts.push({
        number: number,
        title: match[2].trim(),
        index: match.index
      });
    }
  }
  
  // Extract content between sections
  for (let i = 0; i < sectionStarts.length; i++) {
    const current = sectionStarts[i];
    const nextIndex = i < sectionStarts.length - 1 ? sectionStarts[i + 1].index : content.length;
    
    const sectionContent = content.substring(current.index, nextIndex).trim();
    const tokenCount = estimateTokenCount(sectionContent);
    
    // Only add sections with reasonable content (more than just the title)
    if (tokenCount > 10) {
      sections.push({
        section_number: current.number,
        section_title: current.title,
        content: sectionContent,
        token_count: tokenCount
      });
    }
  }
  
  console.log(`  ${metadata.document_id}: ${sections.length} sections`);
  return sections;
}

// Estimate token count (words * 1.3)
function estimateTokenCount(text: string): number {
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  return Math.round(words * 1.3);
}

// Create SQLite database and schema
function createDatabase(dbPath: string): Database.Database {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  
  const db = new Database(dbPath);
  
  db.exec(`
    CREATE TABLE chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      title TEXT NOT NULL,
      version TEXT NOT NULL,
      effective_date TEXT NOT NULL,
      section_number TEXT NOT NULL,
      section_title TEXT NOT NULL,
      content TEXT NOT NULL,
      token_count INTEGER NOT NULL
    );
    CREATE INDEX idx_document ON chunks(document_id);
    CREATE INDEX idx_section ON chunks(section_number);
  `);
  
  return db;
}

// Insert chunks into database
function insertChunks(db: Database.Database, policies: PolicySection[]): void {
  const insert = db.prepare(`
    INSERT INTO chunks (document_id, title, version, effective_date, section_number, section_title, content, token_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertMany = db.transaction((chunks: any[]) => {
    for (const chunk of chunks) {
      insert.run(chunk);
    }
  });
  
  let totalChunks = 0;
  let totalTokens = 0;
  
  for (const policy of policies) {
    const chunks = policy.sections.map(section => [
      policy.metadata.document_id,
      policy.metadata.title,
      policy.metadata.version || 'Not specified',
      policy.metadata.effective_date || 'Not specified',
      section.section_number,
      section.section_title,
      section.content,
      section.token_count
    ]);
    
    insertMany(chunks);
    totalChunks += chunks.length;
    totalTokens += policy.sections.reduce((sum, s) => sum + s.token_count, 0);
  }
  
  const avgChunkSize = totalChunks > 0 ? Math.round(totalTokens / totalChunks) : 0;
  
  console.log(`\nIngestion complete:`);
  console.log(`  Policies: ${policies.length}`);
  console.log(`  Chunks: ${totalChunks}`);
  console.log(`  Avg chunk size: ${avgChunkSize} tokens`);
}

// Main ingestion function
function main() {
  console.log('Starting policy ingestion...\n');
  
  const policiesPath = path.resolve(process.cwd(), POLICIES_PATH);
  const dbPath = path.resolve(process.cwd(), DB_PATH);
  
  console.log(`Reading policies from: ${policiesPath}`);
  console.log(`Creating database at: ${dbPath}\n`);
  
  const policies = parsePoliciesFile(policiesPath);
  
  if (policies.length === 0) {
    console.error('\nERROR: No policies were parsed. Check file format.');
    process.exit(1);
  }
  
  const db = createDatabase(dbPath);
  insertChunks(db, policies);
  db.close();
  
  console.log('\nIngestion successful!');
}

if (require.main === module) {
  main();
}

export { parsePoliciesFile, createDatabase, insertChunks };
