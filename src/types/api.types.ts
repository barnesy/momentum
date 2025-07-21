// API Types
export interface SSEMessage {
  type: string;
  data: unknown;
  timestamp: number;
  clientId?: number;
}

export interface ContextUpdate {
  source: string;
  content: string;
  timestamp: string;
  type?: string;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  uptime: number;
  connections: number;
  sseConnections: number;
  timestamp: number;
}

export interface WebSocketMessage {
  type: string;
  context?: any;
  timestamp: number;
}

export interface AIPrompt {
  prompt: string;
  context?: any;
  model?: string;
}

export interface GitHubConfig {
  repoUrl: string;
  webhookSecret?: string;
}

export interface PerformanceMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
}