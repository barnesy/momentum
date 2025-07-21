export interface SSEClientOptions {
  url: string;
  onMessage?: (data: any) => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  
  constructor(private options: SSEClientOptions) {
    this.connect();
  }

  private connect() {
    try {
      this.eventSource = new EventSource(this.options.url);
      
      this.eventSource.onopen = () => {
        this.reconnectAttempts = 0;
        this.options.onOpen?.();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.options.onMessage?.(data);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        this.options.onError?.(new Error('SSE connection error'));
        this.handleReconnect();
      };
    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= (this.options.maxReconnectAttempts ?? 5)) {
      console.error('Max reconnection attempts reached');
      this.close();
      return;
    }

    this.reconnectAttempts++;
    const interval = this.options.reconnectInterval ?? 3000;
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts})`);
      this.connect();
    }, interval);
  }

  public close() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.options.onClose?.();
  }

  public isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}