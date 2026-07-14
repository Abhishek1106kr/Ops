export type SeverityType = 'critical' | 'warning' | 'info';
export type IncidentStatus = 'active' | 'investigating' | 'mitigating' | 'resolved';
export type ServiceStatus = 'healthy' | 'degraded' | 'down';
export type LogLevel = 'info' | 'warn' | 'error';

export interface Incident {
  id: string;
  title: string;
  severity: SeverityType;
  status: IncidentStatus;
  service: string;
  triggeredAt: string;
  updatedAt: string;
  summary: string;
  description: string;
  rootCause?: string;
  aiExplanation?: string;
  suggestedFixCode?: string;
  filePath?: string;
  slackChannel?: string;
  githubPrNumber?: number;
  githubPrUrl?: string;
}

export interface MetricPoint {
  timestamp: string;
  cpu: number;
  memory: number;
  latency: number;
  errorRate: number;
}

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  type: 'api' | 'database' | 'auth' | 'cache';
  latency: number;
  errorRate: number;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
}

export interface AIReasoning {
  incidentId: string;
  reasoningSteps: string[];
  confidenceScore: number;
  possibleTriggers: string[];
  suggestedFix: {
    description: string;
    filePath: string;
    codeChange: string;
  };
}
