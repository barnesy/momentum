import SimplePeer from 'simple-peer';

interface TransportConfig {
  iceServers?: RTCIceServer[];
  webTransportUrl?: string;
  enableDataChannel?: boolean;
  enableWebTransport?: boolean;
}

interface Message {
  id: string;
  timestamp: number;
  type: 'code' | 'context' | 'command' | 'response';
  payload: any;
  priority: 'high' | 'normal' | 'low';
}

export class HybridTransport extends EventTarget {
  private peer?: SimplePeer.Instance;
  private webTransport?: WebTransport;
  private dataChannel?: RTCDataChannel;
  private messageQueue: Map<string, Message> = new Map();
  private latencyTracker = new LatencyTracker();
  
  constructor(private config: TransportConfig = {}) {
    super();
    this.config = {
      enableDataChannel: true,
      enableWebTransport: true,
      ...config
    };
  }

  async connect(signalData?: SimplePeer.SignalData): Promise<void> {
    if (this.config.enableDataChannel) {
      await this.initWebRTC(signalData);
    }
    
    if (this.config.enableWebTransport && this.config.webTransportUrl) {
      await this.initWebTransport();
    }
  }

  private async initWebRTC(signalData?: SimplePeer.SignalData): Promise<void> {
    this.peer = new SimplePeer({
      initiator: !signalData,
      trickle: false,
      config: {
        iceServers: this.config.iceServers || [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      }
    });

    this.peer.on('signal', (data) => {
      this.dispatchEvent(new CustomEvent('signal', { detail: data }));
    });

    this.peer.on('connect', () => {
      this.dispatchEvent(new Event('rtc-connected'));
      this.setupDataChannel();
    });

    this.peer.on('data', (data) => {
      this.handleMessage(data, 'webrtc');
    });

    this.peer.on('error', (err) => {
      this.dispatchEvent(new CustomEvent('error', { detail: err }));
    });

    if (signalData) {
      this.peer.signal(signalData);
    }
  }

  private async initWebTransport(): Promise<void> {
    if (!this.config.webTransportUrl) return;

    try {
      this.webTransport = new WebTransport(this.config.webTransportUrl);
      await this.webTransport.ready;
      
      this.dispatchEvent(new Event('webtransport-connected'));
      this.setupWebTransportStreams();
    } catch (error) {
      console.error('WebTransport connection failed:', error);
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
    }
  }

  private setupDataChannel(): void {
    if (!this.peer) return;
    
    this.dataChannel = (this.peer as any)._channel;
    this.dataChannel.binaryType = 'arraybuffer';
  }

  private async setupWebTransportStreams(): Promise<void> {
    if (!this.webTransport) return;

    const reader = this.webTransport.incomingUnidirectionalStreams.getReader();
    
    while (true) {
      const { value: stream, done } = await reader.read();
      if (done) break;
      
      this.handleWebTransportStream(stream);
    }
  }

  private async handleWebTransportStream(stream: ReadableStream): Promise<void> {
    const reader = stream.getReader();
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      this.handleMessage(value, 'webtransport');
    }
  }

  async send(message: Message): Promise<void> {
    const start = performance.now();
    message.timestamp = Date.now();
    
    const encoded = this.encodeMessage(message);
    
    const sent = await this.selectTransport(message, encoded);
    
    if (sent) {
      this.latencyTracker.recordSend(message.id, start);
    } else {
      this.messageQueue.set(message.id, message);
    }
  }

  private async selectTransport(message: Message, data: Uint8Array): Promise<boolean> {
    if (message.priority === 'high' && this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(data);
      return true;
    }
    
    if (this.webTransport?.ready) {
      const stream = await this.webTransport.createUnidirectionalStream();
      const writer = stream.getWriter();
      await writer.write(data);
      await writer.close();
      return true;
    }
    
    if (this.peer?.connected) {
      this.peer.send(data);
      return true;
    }
    
    return false;
  }

  private handleMessage(data: ArrayBuffer | Uint8Array, source: 'webrtc' | 'webtransport'): void {
    const message = this.decodeMessage(data);
    
    if (message.type === 'response') {
      const latency = this.latencyTracker.recordReceive(message.id);
      if (latency) {
        this.dispatchEvent(new CustomEvent('latency', { detail: { latency, source } }));
      }
    }
    
    this.dispatchEvent(new CustomEvent('message', { detail: message }));
  }

  private encodeMessage(message: Message): Uint8Array {
    return new TextEncoder().encode(JSON.stringify(message));
  }

  private decodeMessage(data: ArrayBuffer | Uint8Array): Message {
    const text = new TextDecoder().decode(data);
    return JSON.parse(text);
  }

  signal(data: SimplePeer.SignalData): void {
    this.peer?.signal(data);
  }

  async close(): Promise<void> {
    this.peer?.destroy();
    await this.webTransport?.close();
    this.messageQueue.clear();
  }

  getLatencyStats(): LatencyStats {
    return this.latencyTracker.getStats();
  }
}

class LatencyTracker {
  private pending = new Map<string, number>();
  private measurements: number[] = [];
  private maxMeasurements = 100;

  recordSend(id: string, timestamp: number): void {
    this.pending.set(id, timestamp);
  }

  recordReceive(id: string): number | null {
    const sendTime = this.pending.get(id);
    if (!sendTime) return null;
    
    const latency = performance.now() - sendTime;
    this.pending.delete(id);
    
    this.measurements.push(latency);
    if (this.measurements.length > this.maxMeasurements) {
      this.measurements.shift();
    }
    
    return latency;
  }

  getStats(): LatencyStats {
    if (this.measurements.length === 0) {
      return { avg: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0 };
    }
    
    const sorted = [...this.measurements].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    
    return {
      avg: sum / sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }
}

interface LatencyStats {
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}