import { CRMRecord, SkippedRecord, BatchProgress } from '../types';
import { logger } from '../utils/logger';
import { AIManager } from './ai/ai-manager';
import { extractJsonPayload, parseJsonWithCommonRepairs, sanitizeParsed } from './ai/utils';

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '10', 10);

const ALLOWED_STATUS = ['GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE'];
const ALLOWED_SOURCE = ['leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots'];

const SYSTEM_PROMPT = `You are an intelligent CRM data extraction assistant for GrowEasy (a real estate CRM).

You receive CSV records from arbitrary sources: Facebook Lead Ads, Google Ads, real estate CRM exports, marketing agencies, manual Excel sheets, sales reports, etc. Column names will NOT be consistent. You must semantically understand each column and map it into the GrowEasy CRM schema below.

# Target CRM Schema (JSON keys)
- created_at: Lead creation date. MUST be parseable by JavaScript \`new Date()\` (e.g. "2026-05-13T14:20:48Z", "2026-05-13 14:20:48", "2026/05/13"). If unknown, use current ISO date.
- name: Lead name (combine first + last if separate)
- email: PRIMARY email (first if multiple)
- country_code: Dialing code (e.g. "+91", "+1"). If phone is a 10-digit Indian mobile (starts 6-9), default country_code to "+91".
- mobile_without_country_code: Mobile digits only (no spaces, dashes, country code). First if multiple.
- company: Company name
- city: City
- state: State
- country: Country
- lead_owner: Lead owner email (leave blank if unknown)
- crm_status: MUST be one of exactly: ${ALLOWED_STATUS.join(', ')}. If ambiguous/unknown, default to "DID_NOT_CONNECT".
- crm_note: Remarks, follow-up notes, comments, EXTRA emails, EXTRA phone numbers, or any useful info that doesn't fit elsewhere. Combine multiple items. Use literal "\\\\n" (two characters backslash+n) for line breaks — NEVER actual newlines.
- data_source: MUST be one of: ${ALLOWED_SOURCE.join(', ')}. If unknown, leave as "".
- possession_time: Property possession time (e.g. "Immediate", "3 months", "Under construction")
- description: Additional description / message / query text

# Semantic Mapping (examples — apply broadly)
- Phone-like columns: "Phone", "Mobile", "Contact", "tel", "Phone Number", "WhatsApp", "MSISDN"
- Email-like: "Email", "E-mail", "Email Address", "User Email"
- Date-like: "Created", "Created Time", "Submitted", "Lead Date", "Timestamp", "Created at", "Date"
- Name-like: "Name", "Full Name", "First Name"+"Last Name", "Lead Name", "Customer"
- Notes-like: "Comments", "Remarks", "Notes", "Message", "Query", "Description"

# Phone Normalization
- Strip spaces, dashes, parentheses.
- If phone starts with +91 or 91 and is 12 digits, separate into country_code="+91" and 10-digit mobile.
- If phone is 10 digits starting 6-9, country_code defaults to "+91".
- If phone is international with explicit + prefix, extract country code.

# Rules (CRITICAL)
1. SKIP records with NEITHER an email NOR a mobile number. Put them in "skipped" array with row_index and a short reason.
2. Multiple emails: first → email; rest → crm_note as "Other emails: x@y.com, a@b.com".
3. Multiple mobiles: first → mobile_without_country_code; rest → crm_note as "Other numbers: 99999, 88888".
4. NEVER embed raw newlines inside any field. Always use the escaped two-character sequence "\\\\n".
5. For crm_status, infer from text: "follow up" → GOOD_LEAD_FOLLOW_UP; "did not pick"/"no answer"/"busy" → DID_NOT_CONNECT; "not interested"/"rejected" → BAD_LEAD; "sale"/"closed"/"won"/"deal" → SALE_DONE.
6. For data_source, look for project/source name: "Leads on Demand"→leads_on_demand; "Meridian Tower"→meridian_tower; "Eden Park"→eden_park; "Varah Swamy"→varah_swamy; "Sarjapur Plots"→sarjapur_plots. Otherwise "".
7. Output ONLY valid JSON — no markdown fences, no prose.

# Output Format (strict)
{
  "parsed": [
    {
      "created_at": "...",
      "name": "...",
      "email": "...",
      "country_code": "...",
      "mobile_without_country_code": "...",
      "company": "...",
      "city": "...",
      "state": "...",
      "country": "...",
      "lead_owner": "...",
      "crm_status": "GOOD_LEAD_FOLLOW_UP" | "DID_NOT_CONNECT" | "BAD_LEAD" | "SALE_DONE",
      "crm_note": "...",
      "data_source": "leads_on_demand" | "meridian_tower" | "eden_park" | "varah_swamy" | "sarjapur_plots" | "",
      "possession_time": "...",
      "description": "..."
    }
  ],
  "skipped": [
    { "row_index": 0, "reason": "No email or mobile number found" }
  ]
}`;

export interface AIBatchResponse {
  parsed: CRMRecord[];
  skipped: { row_index: number; reason: string }[];
}

const CRM_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    parsed: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          created_at: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          country_code: { type: 'string' },
          mobile_without_country_code: { type: 'string' },
          company: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' },
          lead_owner: { type: 'string' },
          crm_status: { type: 'string', enum: ALLOWED_STATUS },
          crm_note: { type: 'string' },
          data_source: { type: 'string', enum: [...ALLOWED_SOURCE, ''] },
          possession_time: { type: 'string' },
          description: { type: 'string' },
        },
        required: [
          'created_at', 'name', 'email', 'country_code',
          'mobile_without_country_code', 'company', 'city', 'state',
          'country', 'lead_owner', 'crm_status', 'crm_note',
          'data_source', 'possession_time', 'description',
        ],
      },
    },
    skipped: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          row_index: { type: 'integer' },
          reason: { type: 'string' },
        },
        required: ['row_index', 'reason'],
      },
    },
  },
  required: ['parsed', 'skipped'],
};

export interface ExtractionOptions {
  onProgress?: (p: BatchProgress) => void;
}

// Singleton AI Manager instance
let aiManager: AIManager | null = null;

function getAIManager(): AIManager {
  if (!aiManager) {
    aiManager = new AIManager();
  }
  return aiManager;
}

export async function extractCRMRecords(
  records: Record<string, unknown>[],
  options: ExtractionOptions = {}
): Promise<{ parsed: CRMRecord[]; skipped: SkippedRecord[] }> {
  if (!records.length) return { parsed: [], skipped: [] };

  const total = records.length;
  const totalBatches = Math.ceil(total / BATCH_SIZE);
  const allParsed: CRMRecord[] = [];
  const allSkipped: SkippedRecord[] = [];

  for (let i = 0; i < totalBatches; i++) {
    const start = i * BATCH_SIZE;
    const batch = records.slice(start, start + BATCH_SIZE);
    const batchIndexed = batch.map((record, idx) => ({
      _row_index: start + idx,
      ...removeEmptyFields(record),
    }));

    const result = await callAI(batchIndexed);

    allParsed.push(...sanitizeParsed(result.parsed));

    for (const s of result.skipped) {
      allSkipped.push({
        row_index: s.row_index,
        reason: s.reason,
        record: batchIndexed.find((r) => r._row_index === s.row_index) ?? {},
      });
    }

    options.onProgress?.({
      batch_index: i + 1,
      total_batches: totalBatches,
      processed: Math.min(start + BATCH_SIZE, total),
      total,
    });
  }

  return { parsed: allParsed, skipped: allSkipped };
}

async function callAI(batch: unknown[]): Promise<AIBatchResponse> {
  const userPrompt = `
Process these ${batch.length} CSV records into GrowEasy CRM format.

Return ONLY valid JSON.

Records:

${JSON.stringify(batch, null, 2)}
`;

  const manager = getAIManager();
  const providerList = manager.availableProviders.join(', ');
  logger.info(`Calling AI provider(s): ${providerList} batch_size=${batch.length}`);

  const result = await manager.generateContent(userPrompt, SYSTEM_PROMPT, {
    responseMimeType: 'application/json',
    responseJsonSchema: CRM_RESPONSE_SCHEMA,
    temperature: 0.1,
    maxOutputTokens: parseInt(process.env.AI_MAX_OUTPUT_TOKENS || '16384', 10),
  });

  const content = result.content;
  if (!content) throw new Error('AI returned empty response');

  logger.info(`AI response received from ${result.provider} (${result.model})`);

  try {
    return parseAIBatchResponse(content);
  } catch (e) {
    logger.error('AI returned invalid JSON', {
      error: (e as Error)?.message,
      provider: result.provider,
      contentLength: content.length,
    });
    throw new Error(`AI (${result.provider}) returned invalid JSON. Try adjusting batch size.`);
  }
}

function removeEmptyFields(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).filter(([_, value]) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      return true;
    })
  );
}

export function parseAIBatchResponse(content: string): AIBatchResponse {
  const payload = extractJsonPayload(content);
  const parsed = parseJsonWithCommonRepairs(payload);

  if (!isObject(parsed)) {
    throw new Error('AI JSON payload must be an object');
  }

  return {
    parsed: Array.isArray(parsed.parsed) ? (parsed.parsed as CRMRecord[]) : [],
    skipped: Array.isArray(parsed.skipped)
      ? (parsed.skipped as { row_index: number; reason: string }[])
      : [],
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}