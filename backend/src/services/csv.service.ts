import { parse } from 'csv-parse';
import { ParsedCSV } from '../types';
import { logger } from '../utils/logger';

/**
 * Parses a CSV buffer into records with normalized headers.
 * Uses streaming-friendly csv-parse with relaxed settings to handle
 * messy real-world CSVs (mismatched columns, BOM, loose quotes, etc).
 */
export async function parseCSVBuffer(buffer: Buffer): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    const records: Record<string, string>[] = [];
    let headers: string[] = [];

    const parser = parse({
      columns: (headerRow: string[]) => {
        headers = headerRow.map((h) => (h ?? '').trim());
        return headers;
      },
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
      bom: true,
      max_record_size: 1024 * 1024,
    });

    parser.on('data', (row) => {
      if (row && typeof row === 'object') records.push(row);
    });

    parser.on('end', () => {
      logger.info(`CSV parsed: ${records.length} rows, ${headers.length} columns`);
      resolve({ headers, records, totalRows: records.length });
    });

    parser.on('error', (err) => {
      logger.error('CSV parse error', { error: err.message });
      reject(err);
    });

    parser.write(buffer);
    parser.end();
  });
}