export interface WebSocketClientOptions {
  url: string;
  onMessage?: (data: any) => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  protocols?: string | string[];
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageQueue: any[] = [];
  
  constructor(private options: WebSocketClientOptions) {
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(this.options.url, this.options.protocols);
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.flushMessageQueue();
        this.options.onOpen?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.options.onMessage?.(data);
        } catch (error) {
          // Handle non-JSON messages
          this.options.onMessage?.(event.data);
        }
      };

      this.ws.onerror = (error) => {
        this.options.onError?.(new Error('WebSocket connection error'));
      };

      this.ws.onclose = () => {
        this.handleReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
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

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  public send(data: any) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    
    if (this.isConnected()) {
      this.ws!.send(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  public close() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.messageQueue = [];
    this.options.onClose?.();
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}