import { CRMRecord } from '../../types';

const ALLOWED_STATUS = ['GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE'];
const ALLOWED_SOURCE = ['leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots'];

/** Enforces allowed enum values and strips stray newlines. */
export function sanitizeParsed(records: CRMRecord[]): CRMRecord[] {
  return records.map((r) => ({
    ...r,
    crm_status: (ALLOWED_STATUS.includes(r.crm_status) ? r.crm_status : 'DID_NOT_CONNECT') as CRMRecord['crm_status'],
    data_source: (ALLOWED_SOURCE.includes(r.data_source) ? r.data_source : '') as CRMRecord['data_source'],
    crm_note: (r.crm_note ?? '').replace(/\r?\n/g, '\\n'),
    description: (r.description ?? '').replace(/\r?\n/g, '\\n'),
  }));
}

/** Extract JSON payload from text, handling markdown fences and surrounding prose. */
export function extractJsonPayload(content: string): string {
  let text = content.trim().replace(/^\uFEFF/, '');
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i) ?? text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    text = fenced[1].trim();
  }

  return extractBalancedObject(text) ?? text;
}

function extractBalancedObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  return null;
}

/** Attempt to parse JSON with common repair strategies. */
export function parseJsonWithCommonRepairs(payload: string): unknown {
  const candidates = [
    payload,
    removeTrailingCommas(payload),
    escapeControlCharactersInsideStrings(payload),
    removeTrailingCommas(escapeControlCharactersInsideStrings(payload)),
  ];

  let lastError: unknown;
  for (const candidate of [...new Set(candidates)]) {
    try {
      return JSON.parse(candidate);
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError;
}

function removeTrailingCommas(payload: string): string {
  let output = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < payload.length; i++) {
    const char = payload[i];

    if (inString) {
      output += char;
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      output += char;
      continue;
    }

    if (char === ',') {
      let next = i + 1;
      while (/\s/.test(payload[next] ?? '')) next += 1;
      if (payload[next] === '}' || payload[next] === ']') continue;
    }

    output += char;
  }

  return output;
}

function escapeControlCharactersInsideStrings(payload: string): string {
  let output = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < payload.length; i++) {
    const char = payload[i];

    if (!inString) {
      output += char;
      if (char === '"') inString = true;
      continue;
    }

    if (escaped) {
      output += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      output += char;
      escaped = true;
    } else if (char === '"') {
      output += char;
      inString = false;
    } else if (char === '\r') {
      if (payload[i + 1] === '\n') i += 1;
      output += '\\n';
    } else if (char === '\n') {
      output += '\\n';
    } else if (char === '\t') {
      output += '\\t';
    } else {
      output += char;
    }
  }

  return output;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}