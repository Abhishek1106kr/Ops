export interface MockIncident {
  id: string;
  service: string;
  severity: 'P1' | 'P2' | 'P3';
  status: 'Investigating' | 'Active' | 'Mitigating' | 'Resolved';
  rootCause: string;
  confidence: number;
  developer: string;
  relatedPR: string;
  triggeredAt: string;
  updatedAt: string;
  summary: string;
  description: string;
  filePath: string;
  slackChannel: string;
  suggestedFixCode: string;
}

export const mockIncident: MockIncident = {
  id: "INC-104",
  service: "Checkout API",
  severity: "P1",
  status: "Investigating",
  rootCause: "Database Index Missing",
  confidence: 96,
  developer: "Abhi",
  relatedPR: "#432",
  triggeredAt: "11:24 AM",
  updatedAt: "11:26 AM",
  summary: "Database read timeout on Checkout transactions. High latency on query processing.",
  description: "Checkout API latency escalated to 8.2s resulting in 504 timeouts. The problem originated immediately following the 11:23 AM deployment of payment retry features.",
  filePath: "apps/checkout/db/schema.sql",
  slackChannel: "#alerts-checkout-p1",
  suggestedFixCode: `diff
-- Migration script: Add missing index for quick orders lookup
-SELECT * FROM orders WHERE customer_id = ? AND status = 'PENDING';
+CREATE INDEX CONCURRENTLY idx_orders_customer_status 
+ON orders(customer_id, status) 
+WHERE status = 'PENDING';`
};

export const mockIncidents: MockIncident[] = [
  mockIncident,
  {
    id: "INC-102",
    service: "Auth API",
    severity: "P2",
    status: "Resolved",
    rootCause: "Expired Cache Key TTL",
    confidence: 84,
    developer: "Elena",
    relatedPR: "#412",
    triggeredAt: "09:12 AM",
    updatedAt: "09:40 AM",
    summary: "High verification error rate in user logins.",
    description: "Session token validation checks began throwing authentication faults. Cache keys had expired without rolling renewals.",
    filePath: "apps/auth/redis.ts",
    slackChannel: "#alerts-auth",
    suggestedFixCode: `diff
-client.set(key, val);
+client.set(key, val, { EX: 900 }); // 15 mins TTL`
  }
];

export interface MockTimelineEvent {
  time: string;
  event: string;
  description: string;
}

export const mockTimeline: MockTimelineEvent[] = [
  { time: "11:23 AM", event: "Deployment", description: "V1.4.2 released with transaction optimizations." },
  { time: "11:24 AM", event: "CPU Spike", description: "Database pool connections reached 98% saturation." },
  { time: "11:25 AM", event: "Errors", description: "Gateway timeout errors (504) spiked to 14.5%." },
  { time: "11:26 AM", event: "AI Investigation", description: "Sentinel Core initiated transaction log trace diagnostics." },
  { time: "11:27 AM", event: "Root Cause Identified", description: "Database analyzer isolated missing composite index on orders table." }
];

export interface MockService {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  type: 'api' | 'database' | 'auth' | 'cache';
  latency: number;
}

export const mockServices: MockService[] = [
  { name: "Checkout API", status: "down", type: "api", latency: 8200 },
  { name: "Auth API", status: "healthy", type: "auth", latency: 45 },
  { name: "Database Cluster", status: "degraded", type: "database", latency: 3100 },
  { name: "Redis Cache", status: "healthy", type: "cache", latency: 2 },
  { name: "API Gateway", status: "healthy", type: "api", latency: 28 }
];

export interface MockMetricPoint {
  timestamp: string;
  cpu: number;
  memory: number;
  latency: number;
  errorRate: number;
}

export const mockMetrics: MockMetricPoint[] = Array.from({ length: 30 }, (_, idx) => {
  const isAnomalous = idx >= 15 && idx <= 25;
  return {
    timestamp: new Date(Date.now() - (30 - idx) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu: isAnomalous ? Math.floor(Math.random() * 20) + 78 : Math.floor(Math.random() * 15) + 12,
    memory: isAnomalous ? Math.floor(Math.random() * 10) + 82 : Math.floor(Math.random() * 8) + 40,
    latency: isAnomalous ? Math.floor(Math.random() * 3000) + 5000 : Math.floor(Math.random() * 30) + 20,
    errorRate: isAnomalous ? Math.floor(Math.random() * 8) + 10 : Math.floor(Math.random() * 2) / 10
  };
});
