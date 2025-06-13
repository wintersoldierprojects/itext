// lib/metrics/network-monitor.ts
export class NetworkMonitor {
  private requests: NetworkRequest[] = [];
  
  constructor() {
    this.interceptFetch();
    this.interceptXHR();
  }
  
  private interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const request = this.parseRequest(args);
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        this.captureRequest({
          ...request,
          status: response.status,
          statusText: response.statusText,
          duration,
          success: response.ok,
          timestamp: new Date().toISOString(),
        } as NetworkRequest);
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        this.captureRequest({
          ...request,
          status: 0,
          statusText: 'Network Error',
          duration,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        } as NetworkRequest);
        
        throw error;
      }
    };
  }

  private interceptXHR() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function (method, url) {
      this._method = method;
      this._url = url as string;
      originalOpen.apply(this, arguments as any);
    };
    
    XMLHttpRequest.prototype.send = function () {
      const startTime = Date.now();
      
      this.addEventListener('load', () => {
        const duration = Date.now() - startTime;
        (this as any).captureRequest({
          url: this._url,
          method: this._method,
          status: this.status,
          statusText: this.statusText,
          duration,
          success: this.status >= 200 && this.status < 300,
          timestamp: new Date().toISOString(),
        });
      });
      
      this.addEventListener('error', () => {
        const duration = Date.now() - startTime;
        (this as any).captureRequest({
          url: this._url,
          method: this._method,
          status: this.status,
          statusText: this.statusText,
          duration,
          success: false,
          error: 'XHR Error',
          timestamp: new Date().toISOString(),
        });
      });
      
      originalSend.apply(this, arguments as any);
    };
  }
  
  private parseRequest(args: any[]): Partial<NetworkRequest> {
    const [input, init] = args;
    
    if (typeof input === 'string') {
      return {
        url: input,
        method: init?.method || 'GET',
      };
    } else if (input instanceof Request) {
      return {
        url: input.url,
        method: input.method,
      };
    }
    
    return { url: 'unknown', method: 'unknown' };
  }

  private captureRequest(request: NetworkRequest) {
    this.requests.push(request);
  }
}

interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  statusText: string;
  duration: number;
  success: boolean;
  error?: string;
  timestamp: string;
}

// Extend the XMLHttpRequest prototype
declare global {
  interface XMLHttpRequest {
    _method: string;
    _url: string;
    captureRequest(request: NetworkRequest): void;
  }
}
