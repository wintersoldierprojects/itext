// lib/metrics/performance-monitor.ts
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: [],
    memory: [],
    loadTime: 0,
    renderTime: 0,
  };
  
  private fpsInterval?: number;
  private memoryInterval?: number;
  
  constructor() {
    this.measureLoadTime();
    this.startFPSMonitoring();
    this.startMemoryMonitoring();
  }
  
  private measureLoadTime() {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
        this.metrics.renderTime = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      }
    }
  }
  
  private startFPSMonitoring() {
    let lastTime = performance.now();
    let frames = 0;
    
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        
        this.metrics.fps.push({
          value: fps,
          timestamp: new Date().toISOString(),
        });
        
        // Keep only last 60 seconds
        if (this.metrics.fps.length > 60) {
          this.metrics.fps.shift();
        }
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }
  
  private startMemoryMonitoring() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      this.memoryInterval = window.setInterval(() => {
        const memory = (performance as any).memory;
        
        this.metrics.memory.push({
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
          timestamp: new Date().toISOString(),
        });
        
        // Keep only last 5 minutes
        if (this.metrics.memory.length > 300) {
          this.metrics.memory.shift();
        }
      }, 1000);
    }
  }
  
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  getAverageFPS(): number {
    if (this.metrics.fps.length === 0) return 0;
    
    const sum = this.metrics.fps.reduce((acc, item) => acc + item.value, 0);
    return Math.round(sum / this.metrics.fps.length);
  }
  
  destroy() {
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
  }
}

export interface PerformanceMetrics {
  fps: Array<{ value: number; timestamp: string }>;
  memory: Array<{ used: number; total: number; limit: number; timestamp: string }>;
  loadTime: number;
  renderTime: number;
}
