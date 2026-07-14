"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchIncidents, fetchServices, fetchIncidentById, resolveIncident, triggerOutage } from '../services/incidents';

export function useIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: fetchIncidents
  });
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: fetchServices
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ['incident', id],
    queryFn: () => fetchIncidentById(id),
    enabled: !!id
  });
}

export function useResolveIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolveIncident(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    }
  });
}

export function useTriggerOutage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ service, severity }: { service: string; severity: 'critical' | 'warning' }) =>
      triggerOutage(service, severity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    }
  });
}
