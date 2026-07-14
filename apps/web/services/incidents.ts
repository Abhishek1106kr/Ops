const BASE_URL = 'http://localhost:8000/api/incidents';

export async function fetchIncidents() {
  const res = await fetch(`${BASE_URL}/`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function fetchServices() {
  const res = await fetch(`${BASE_URL}/services`);
  if (!res.ok) throw new Error('Failed to fetch services');
  return res.json();
}

export async function fetchIncidentById(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch incident ${id}`);
  return res.json();
}

export async function resolveIncident(id: string) {
  const res = await fetch(`${BASE_URL}/${id}/resolve`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Failed to resolve incident ${id}`);
  return res.json();
}

export async function triggerOutage(service: string, severity: 'critical' | 'warning') {
  const res = await fetch(`${BASE_URL}/trigger-outage?service_name=${encodeURIComponent(service)}&severity=${severity}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Failed to trigger outage on ${service}`);
  return res.json();
}
