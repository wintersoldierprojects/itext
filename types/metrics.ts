// Metrics and Performance Types
export interface ErrorEntry {
  id: string;
  type: string;
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: string;
  count: number;
  firstOccurrence: string;
  lastOccurrence: string;
  args?: unknown[];
}

export interface MetricsFilter {
  type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timeRange?: number;
  search?: string;
}

export interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  statusText: string;
  duration: number;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface PerformanceMetrics {
  fps: Array<{ value: number; timestamp: string }>;
  memory: Array<{ used: number; total: number; limit: number; timestamp: string }>;
  loadTime: number;
  renderTime: number;
}

export interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
}

export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  version?: string;
}

export interface DebugLogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: unknown;
  timestamp: string;
  component?: string;
}

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface ServiceWorkerMessage {
  type: string;
  payload?: unknown;
}

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: unknown;
}
