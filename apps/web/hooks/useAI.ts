"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDiagnosis } from '../services/ai';
import { triggerGithubPR } from '../services/github';

export function useDiagnosis(incidentId: string) {
  return useQuery({
    queryKey: ['diagnosis', incidentId],
    queryFn: () => fetchDiagnosis(incidentId),
    enabled: !!incidentId
  });
}

export function useTriggerRemediation(incidentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => triggerGithubPR(incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    }
  });
}
