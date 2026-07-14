const BASE_URL = 'http://localhost:8000/api/ai';

export async function fetchDiagnosis(incidentId: string) {
  const res = await fetch(`${BASE_URL}/diagnose/${incidentId}`);
  if (!res.ok) throw new Error(`Failed to fetch AI diagnosis for ${incidentId}`);
  return res.json();
}
