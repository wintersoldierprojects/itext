'use client';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceThresholds {
  messageLatency: number; // ms
  renderTime: number; // ms
  memoryUsage: number; // MB
  fps: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThresholds = {
    messageLatency: 100, // 100ms target
    renderTime: 16, // 60fps = 16ms per frame
    memoryUsage: 100, // 100MB
    fps: 55, // Minimum acceptable FPS
  };
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return;

    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart);
              this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart);
              this.recordMetric('first_paint', navEntry.loadEventEnd - navEntry.fetchStart);
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }

      // Observe paint timing
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric(entry.name.replace('-', '_'), entry.startTime);
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('paint', paintObserver);
      } catch (error) {
        console.warn('Paint observer not supported:', error);
      }

      // Observe largest contentful paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('largest_contentful_paint', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // Observe layout shifts
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.recordMetric('cumulative_layout_shift', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }
    }
  }

  // Record a custom performance metric
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }

    // Check thresholds and alert if exceeded
    this.checkThreshold(metric);

    console.log(`📊 Performance: ${name} = ${value}ms`, metadata);
  }

  // Measure message send/receive latency
  measureMessageLatency(startTime: number, messageId: string) {
    const latency = Date.now() - startTime;
    this.recordMetric('message_latency', latency, { messageId });
    return latency;
  }

  // Measure component render time
  measureRenderTime<T>(componentName: string, renderFn: () => T): T {
    const startTime = performance.now();
    const result = renderFn();
    const renderTime = performance.now() - startTime;
    this.recordMetric('render_time', renderTime, { component: componentName });
    return result;
  }

  // Measure async operation time
  async measureAsyncOperation<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      this.recordMetric('async_operation', duration, { operation: operationName, success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric('async_operation', duration, { operation: operationName, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  // Get memory usage
  getMemoryUsage() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
      
      this.recordMetric('memory_used', usedMB);
      this.recordMetric('memory_total', totalMB);
      this.recordMetric('memory_limit', limitMB);
      
      return { used: usedMB, total: totalMB, limit: limitMB };
    }
    return null;
  }

  // Measure FPS
  measureFPS(duration: number = 1000): Promise<number> {
    return new Promise((resolve) => {
      let frames = 0;
      const startTime = performance.now();
      
      const countFrame = () => {
        frames++;
        const currentTime = performance.now();
        
        if (currentTime - startTime < duration) {
          requestAnimationFrame(countFrame);
        } else {
          const fps = Math.round((frames * 1000) / (currentTime - startTime));
          this.recordMetric('fps', fps);
          resolve(fps);
        }
      };
      
      requestAnimationFrame(countFrame);
    });
  }

  // Check if metric exceeds threshold
  private checkThreshold(metric: PerformanceMetric) {
    let threshold: number | undefined;
    
    switch (metric.name) {
      case 'message_latency':
        threshold = this.thresholds.messageLatency;
        break;
      case 'render_time':
        threshold = this.thresholds.renderTime;
        break;
      case 'memory_used':
        threshold = this.thresholds.memoryUsage;
        break;
      case 'fps':
        if (metric.value < this.thresholds.fps) {
          this.alertThresholdExceeded(metric, this.thresholds.fps);
        }
        return;
    }
    
    if (threshold && metric.value > threshold) {
      this.alertThresholdExceeded(metric, threshold);
    }
  }

  // Alert when threshold is exceeded
  private alertThresholdExceeded(metric: PerformanceMetric, threshold: number) {
    console.warn(`⚠️ Performance threshold exceeded: ${metric.name} = ${metric.value} (threshold: ${threshold})`);
    
    // Dispatch custom event for performance alerts
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('performance-alert', {
        detail: { metric, threshold }
      }));
    }
  }

  // Get performance summary
  getPerformanceSummary(timeRange: number = 60000) { // Last minute by default
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp <= timeRange);
    
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    recentMetrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = { avg: 0, min: Infinity, max: -Infinity, count: 0 };
      }
      
      const s = summary[metric.name];
      s.count++;
      s.min = Math.min(s.min, metric.value);
      s.max = Math.max(s.max, metric.value);
      s.avg = (s.avg * (s.count - 1) + metric.value) / s.count;
    });
    
    return summary;
  }

  // Export metrics for analysis
  exportMetrics(format: 'json' | 'csv' = 'json') {
    if (format === 'csv') {
      const headers = ['name', 'value', 'timestamp', 'metadata'];
      const rows = this.metrics.map(m => [
        m.name,
        m.value,
        m.timestamp,
        JSON.stringify(m.metadata || {})
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(this.metrics, null, 2);
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics = [];
  }

  // Cleanup observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const recordMetric = (name: string, value: number, metadata?: Record<string, any>) => {
    performanceMonitor.recordMetric(name, value, metadata);
  };

  const measureRenderTime = <T>(componentName: string, renderFn: () => T): T => {
    return performanceMonitor.measureRenderTime(componentName, renderFn);
  };

  const measureAsyncOperation = <T>(operationName: string, operation: () => Promise<T>): Promise<T> => {
    return performanceMonitor.measureAsyncOperation(operationName, operation);
  };

  const getMemoryUsage = () => {
    return performanceMonitor.getMemoryUsage();
  };

  const measureFPS = (duration?: number) => {
    return performanceMonitor.measureFPS(duration);
  };

  const getPerformanceSummary = (timeRange?: number) => {
    return performanceMonitor.getPerformanceSummary(timeRange);
  };

  return {
    recordMetric,
    measureRenderTime,
    measureAsyncOperation,
    getMemoryUsage,
    measureFPS,
    getPerformanceSummary,
  };
}

// Performance timing utilities
export const perf = {
  mark: (name: string) => {
    if (typeof window !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },
  
  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof window !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name, 'measure');
        if (entries.length > 0) {
          const duration = entries[entries.length - 1].duration;
          performanceMonitor.recordMetric(name, duration);
          return duration;
        }
      } catch (error) {
        console.warn('Performance measure failed:', error);
      }
    }
    return 0;
  },
  
  now: () => {
    return typeof window !== 'undefined' ? performance.now() : Date.now();
  }
};
