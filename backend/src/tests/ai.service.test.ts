import { describe, expect, it } from '@jest/globals';
import { parseAIBatchResponse } from '../services/ai.service';
import { sanitizeParsed } from '../services/ai/utils';
import type { CRMRecord } from '../types';

function crmRecord(overrides: Partial<CRMRecord> = {}): CRMRecord {
  return {
    created_at: '2026-07-08T00:00:00.000Z',
    name: 'Test Lead',
    email: 'lead@example.com',
    country_code: '+91',
    mobile_without_country_code: '9876543210',
    company: '',
    city: '',
    state: '',
    country: '',
    lead_owner: '',
    crm_status: 'GOOD_LEAD_FOLLOW_UP',
    crm_note: '',
    data_source: '',
    possession_time: '',
    description: '',
    ...overrides,
  };
}

describe('sanitizeParsed', () => {
  it('clamps invalid crm_status to DID_NOT_CONNECT', () => {
    const out = sanitizeParsed([
      crmRecord({ crm_status: 'WON' as unknown as CRMRecord['crm_status'] }),
    ]);
    expect(out[0].crm_status).toBe('DID_NOT_CONNECT');
  });

  it('clears invalid data_source', () => {
    const out = sanitizeParsed([
      crmRecord({ data_source: 'facebook' as unknown as CRMRecord['data_source'] }),
    ]);
    expect(out[0].data_source).toBe('');
  });

  it('escapes raw newlines in crm_note', () => {
    const out = sanitizeParsed([crmRecord({ crm_note: 'line1\nline2' })]);
    expect(out[0].crm_note).toBe('line1\\nline2');
  });

  it('escapes raw newlines in description', () => {
    const out = sanitizeParsed([crmRecord({ description: 'line1\r\nline2' })]);
    expect(out[0].description).toBe('line1\\nline2');
  });
});

describe('parseAIBatchResponse', () => {
  it('parses valid batch JSON', () => {
    const out = parseAIBatchResponse('{"parsed":[{"name":"Rahul"}],"skipped":[]}');
    expect(out.parsed).toHaveLength(1);
    expect(out.skipped).toHaveLength(0);
  });

  it('extracts JSON from markdown fences', () => {
    const out = parseAIBatchResponse('```json\n{"parsed":[],"skipped":[{"row_index":1,"reason":"Missing contact"}]}\n```');
    expect(out.parsed).toHaveLength(0);
    expect(out.skipped[0].reason).toBe('Missing contact');
  });

  it('extracts JSON when prose surrounds it', () => {
    const out = parseAIBatchResponse('Here is the JSON:\n{"parsed":[],"skipped":[]}\nDone.');
    expect(out).toEqual({ parsed: [], skipped: [] });
  });

  it('repairs trailing commas', () => {
    const out = parseAIBatchResponse('{"parsed":[{"name":"Rahul",}],"skipped":[],}');
    expect(out.parsed[0].name).toBe('Rahul');
  });

  it('repairs raw newlines inside strings', () => {
    const out = parseAIBatchResponse('{"parsed":[{"crm_note":"line1\nline2"}],"skipped":[]}');
    expect(out.parsed[0].crm_note).toBe('line1\nline2');
  });
});