export type CrmStatus = 'GOOD_LEAD_FOLLOW_UP' | 'DID_NOT_CONNECT' | 'BAD_LEAD' | 'SALE_DONE' | '';
export type DataSource = 'leads_on_demand' | 'meridian_tower' | 'eden_park' | 'varah_swamy' | 'sarjapur_plots' | '';

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
  crm_status: CrmStatus;
  crm_note: string;
  data_source: DataSource;
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

export interface BatchProgress {
  batch_index: number;
  total_batches: number;
  processed: number;
  total: number;
}

export interface ParsedCSV {
  headers: string[];
  records: Record<string, string>[];
  totalRows: number;
}