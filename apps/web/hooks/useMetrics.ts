"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchMetrics } from '../services/metrics';

export function useMetrics() {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics
  });
}
