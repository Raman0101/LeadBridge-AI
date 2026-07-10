const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

export async function parseCSV(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_BASE}/parse`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
  return res.json();
}

export async function extractCRM(records: Record<string, unknown>[]) {
  const res = await fetch(`${API_BASE}/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
  return res.json();
}