// lib/metrics/error-capture.ts
export class MetricsCapture {
  private static instance: MetricsCapture;
  private errors: ErrorEntry[] = [];
  private maxEntries = 1000;
  private deduplicationWindow = 60000; // 1 minute
  
  constructor() {
    this.setupGlobalHandlers();
    this.setupConsoleInterception();
  }
  
  static getInstance() {
    if (!MetricsCapture.instance) {
      MetricsCapture.instance = new MetricsCapture();
    }
    return MetricsCapture.instance;
  }
  
  private setupGlobalHandlers() {
    // Capture unhandled errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError({
          type: 'runtime-error',
          message: event.message,
          stack: event.error?.stack,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          timestamp: new Date().toISOString(),
        } as ErrorEntry);
      });
      
      // Capture unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError({
          type: 'unhandled-promise',
          message: event.reason?.message || String(event.reason),
          stack: event.reason?.stack,
          timestamp: new Date().toISOString(),
        } as ErrorEntry);
      });
    }
  }
  
  private setupConsoleInterception() {
    if (typeof window === 'undefined') return;
    
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      debug: console.debug,
      info: console.info,
    };
    
    // Intercept console methods
    Object.keys(originalConsole).forEach((method) => {
      const originalMethod = originalConsole[method as keyof typeof originalConsole];
      
      (console as any)[method] = (...args: any[]) => {
        // Call original method
        originalMethod.apply(console, args);
        
        // Capture for metrics
        this.captureLog({
          type: `console-${method}`,
          message: args.map(arg => this.stringifyArg(arg)).join(' '),
          timestamp: new Date().toISOString(),
          args: args,
        });
      };
    });
  }
  
  private stringifyArg(arg: any): string {
    if (typeof arg === 'string') return arg;
    if (arg instanceof Error) return `${arg.name}: ${arg.message}\n${arg.stack}`;
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  
  private captureError(error: ErrorEntry) {
    // Check for duplicates
    const isDuplicate = this.checkDuplicate(error);
    
    if (isDuplicate) {
      isDuplicate.count++;
      isDuplicate.lastOccurrence = error.timestamp;
    } else {
      this.errors.push({
        ...error,
        id: this.generateId(),
        count: 1,
        firstOccurrence: error.timestamp,
        lastOccurrence: error.timestamp,
      });
    }
    
    // Maintain max entries
    if (this.errors.length > this.maxEntries) {
      this.errors.shift();
    }
    
    // Broadcast update
    this.broadcastUpdate();
  }

  private captureLog(log: any) {
    this.errors.push({
      ...log,
      id: this.generateId(),
      count: 1,
      firstOccurrence: log.timestamp,
      lastOccurrence: log.timestamp,
    });

    if (this.errors.length > this.maxEntries) {
      this.errors.shift();
    }

    this.broadcastUpdate();
  }
  
  private checkDuplicate(error: ErrorEntry): ErrorEntry | null {
    const now = new Date().getTime();
    
    return this.errors.find(e => {
      const timeDiff = now - new Date(e.lastOccurrence).getTime();
      if (timeDiff > this.deduplicationWindow) return false;
      
      // Compare key fields for similarity
      return (
        e.type === error.type &&
        e.message === error.message &&
        e.filename === error.filename &&
        e.lineno === error.lineno
      );
    }) || null;
  }
  
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private broadcastUpdate() {
    // Send to metrics dashboard via custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('metrics-update', {
        detail: { errors: this.getErrors() }
      }));
    }
  }
  
  getErrors(filters?: MetricsFilter): ErrorEntry[] {
    let filtered = [...this.errors];
    
    if (filters?.type) {
      filtered = filtered.filter(e => e.type === filters.type);
    }
    
    if (filters?.severity) {
      filtered = filtered.filter(e => this.getSeverity(e) === filters.severity);
    }
    
    if (filters?.timeRange) {
      const startTime = new Date().getTime() - filters.timeRange;
      filtered = filtered.filter(e => 
        new Date(e.timestamp).getTime() > startTime
      );
    }
    
    return filtered.sort((a, b) => 
      new Date(b.lastOccurrence).getTime() - new Date(a.lastOccurrence).getTime()
    );
  }
  
  private getSeverity(error: ErrorEntry): 'low' | 'medium' | 'high' | 'critical' {
    if (error.type.includes('error') || error.type === 'unhandled-promise') return 'high';
    if (error.type.includes('warn')) return 'medium';
    if (error.type.includes('syntax')) return 'critical';
    return 'low';
  }
}

// Types
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
  args?: any[];
}

export interface MetricsFilter {
  type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timeRange?: number; // milliseconds
  search?: string;
}
