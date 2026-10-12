const API_BASE = '/api';

// ================= WEBSITE ANALYZER =================

export async function validateUrl(url) {
  const res = await fetch(`${API_BASE}/validate-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  return res.json();
}

export async function startAnalysis(payload) {
  const res = await fetch(`${API_BASE}/websites/analyze`, {
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
  const res = await fetch(`${API_BASE}/websites/${id}/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function getAnalysisResults(id) {
  const res = await fetch(`${API_BASE}/websites/${id}`);
  if (!res.ok) throw new Error('Failed to fetch results');
  return res.json();
}

export function getExcelDownloadUrl(id) {
  return `${API_BASE}/websites/${id}/excel`;
}

export function getPdfDownloadUrl(id) {
  return `${API_BASE}/websites/${id}/pdf`;
}

export function getJsonDownloadUrl(id) {
  return `${API_BASE}/websites/${id}/json`;
}

export function getCsvDownloadUrl(id) {
  return `${API_BASE}/websites/${id}/csv`;
}

// ================= BUSINESS FINDER =================

export async function searchBusinesses(payload) {
  const res = await fetch(`${API_BASE}/business/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Business search failed' }));
    throw new Error(err.detail || 'Business search failed');
  }
  return res.json();
}

export async function getBusinessSearch(id) {
  const res = await fetch(`${API_BASE}/business/search/${id}`);
  if (!res.ok) throw new Error('Failed to fetch business search');
  return res.json();
}

export async function getAllBusinessSearches() {
  const res = await fetch(`${API_BASE}/business/searches`);
  if (!res.ok) throw new Error('Failed to fetch searches');
  return res.json();
}

export async function deleteBusinessSearch(id) {
  const res = await fetch(`${API_BASE}/business/search/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete business search');
  return res.json();
}

export async function clearAllBusinessSearches() {
  const res = await fetch(`${API_BASE}/business/searches`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to clear business searches');
  return res.json();
}

export function getBusinessExcelUrl(id) {
  return `${API_BASE}/business/search/${id}/excel`;
}

export function getAllBusinessesExcelUrl() {
  return `${API_BASE}/business/export/all/excel`;
}

export function getBusinessPdfUrl(id) {
  return `${API_BASE}/business/search/${id}/pdf`;
}

// ================= BATCH ANALYSIS =================

export async function startBatchAnalysis(payload) {
  const res = await fetch(`${API_BASE}/business/batch-analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Batch analysis failed to start' }));
    throw new Error(err.detail || 'Batch analysis request failed');
  }
  return res.json();
}

export async function getBatchJob(id) {
  const res = await fetch(`${API_BASE}/batch/${id}`);
  if (!res.ok) throw new Error('Failed to fetch batch job status');
  return res.json();
}

export async function getAllBatchJobs() {
  const res = await fetch(`${API_BASE}/batch-jobs`);
  if (!res.ok) throw new Error('Failed to fetch batch jobs');
  return res.json();
}

export function getBatchExcelUrl(id) {
  return `${API_BASE}/batch/${id}/excel`;
}

// ================= COMPETITOR COMPARISON =================

export async function compareCompetitors(analysisIds) {
  const res = await fetch(`${API_BASE}/competitor/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysis_ids: analysisIds })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Competitor comparison failed' }));
    throw new Error(err.detail || 'Comparison request failed');
  }
  return res.json();
}

// ================= DASHBOARD & REPORTS =================

export async function getDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function getReports() {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
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
