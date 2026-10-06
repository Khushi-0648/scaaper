const API_BASE = '/api';

export async function validateUrl(url) {
  const res = await fetch(`${API_BASE}/validate-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  return res.json();
}

export async function startAnalysis(payload) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to start analysis' }));
    throw new Error(err.detail || 'Analysis request failed');
  }
  return res.json();
}

export async function getAnalysisStatus(id) {
  const res = await fetch(`${API_BASE}/analyze/${id}/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function getAnalysisResults(id) {
  const res = await fetch(`${API_BASE}/analyze/${id}/results`);
  if (!res.ok) throw new Error('Failed to fetch results');
  return res.json();
}

export function getExcelDownloadUrl(id) {
  return `${API_BASE}/analyze/${id}/excel`;
}

export function getJsonDownloadUrl(id) {
  return `${API_BASE}/analyze/${id}/json`;
}

export function getCsvDownloadUrl(id) {
  return `${API_BASE}/analyze/${id}/csv`;
}

export async function getHistory() {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function deleteHistory(id) {
  const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete history');
  return res.json();
}
