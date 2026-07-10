export interface ParsedCSVResponse {
  filename: string;
  headers: string[];
  records: Record<string, string>[];
  total_rows: number;
}

export type RecordString = Record<string, string>;

export interface CRMRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

export interface SkippedRecord {
  row_index: number;
  reason: string;
  record: Record<string, unknown>;
}

export interface ExtractionResult {
  parsed: CRMRecord[];
  skipped: SkippedRecord[];
  total_parsed: number;
  total_skipped: number;
  total_processed: number;
}
