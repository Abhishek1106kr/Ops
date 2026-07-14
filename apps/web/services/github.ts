const BASE_URL = 'http://localhost:8000/api/github';

export async function triggerGithubPR(incidentId: string) {
  const res = await fetch(`${BASE_URL}/pr/${incidentId}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Failed to deploy remediation PR for ${incidentId}`);
  return res.json();
}
