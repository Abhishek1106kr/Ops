const BASE_URL = 'http://localhost:8000/api/metrics';

export async function fetchMetrics() {
  const res = await fetch(`${BASE_URL}/`);
  if (!res.ok) throw new Error('Failed to fetch metrics history');
  return res.json();
}
