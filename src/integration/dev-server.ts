import { HybridTransport } from '../protocols/hybrid-transport';
import { CodeProtocol } from '../protocols/code-protocol';
import { MultiAgentSystem } from '../agents/agent-system';
import { DistributedAISystem } from '../edge/distributed-ai';
import { EdgeWorker, EdgeWorkerConfig } from '../edge/edge-worker';

interface ServerConfig {
  port: number;
  enableWebRTC: boolean;
  enableWebTransport: boolean;
  edgeWorkerConfig: EdgeWorkerConfig;
  corsOrigins: string[];
}

export class DevelopmentIntegrationServer {
  private transport: HybridTransport;
  private protocol: CodeProtocol;
  private agentSystem: MultiAgentSystem;
  private aiSystem: DistributedAISystem;
  private edgeWorker: EdgeWorker;
  private connections = new Map<string, Connection>();
  private metrics = new ServerMetrics();

  constructor(private config: ServerConfig) {
    this.protocol = new CodeProtocol();
    this.agentSystem = new MultiAgentSystem();
    this.aiSystem = new DistributedAISystem();
    this.edgeWorker = new EdgeWorker(config.edgeWorkerConfig);
    this.transport = new HybridTransport({
      enableDataChannel: config.enableWebRTC,
      enableWebTransport: config.enableWebTransport,
      webTransportUrl: `https://localhost:${config.port}/webtransport`
    });
  }

  async start(): Promise<void> {
    await this.setupTransport();
    await this.setupAgents();
    await this.aiSystem.warmupModels();
    
    console.log(`Development Integration Server started on port ${this.config.port}`);
    console.log(`WebRTC: ${this.config.enableWebRTC ? 'enabled' : 'disabled'}`);
    console.log(`WebTransport: ${this.config.enableWebTransport ? 'enabled' : 'disabled'}`);
  }

  private async setupTransport(): Promise<void> {
    this.transport.addEventListener('signal', (event: any) => {
      this.handleSignal(event.detail);
    });

    this.transport.addEventListener('message', (event: any) => {
      this.handleMessage(event.detail);
    });

    this.transport.addEventListener('rtc-connected', () => {
      console.log('WebRTC connection established');
      this.metrics.recordConnection('webrtc');
    });

    this.transport.addEventListener('webtransport-connected', () => {
      console.log('WebTransport connection established');
      this.metrics.recordConnection('webtransport');
    });

    this.transport.addEventListener('latency', (event: any) => {
      this.metrics.recordLatency(event.detail.latency, event.detail.source);
    });

    this.transport.addEventListener('error', (event: any) => {
      console.error('Transport error:', event.detail);
      this.metrics.recordError(event.detail);
    });
  }

  private async setupAgents(): Promise<void> {
    this.agentSystem.addEventListener('consensus', (event: any) => {
      this.handleConsensus(event.detail);
    });
  }

  private async handleMessage(message: any): Promise<void> {
    const start = performance.now();
    
    try {
      let response;
      
      switch (message.type) {
        case 'code':
          response = await this.handleCodeRequest(message);
          break;
        case 'context':
          response = await this.handleContextRequest(message);
          break;
        case 'command':
          response = await this.handleCommandRequest(message);
          break;
        default:
          response = { error: 'Unknown message type' };
      }

      const processingTime = performance.now() - start;
      
      await this.transport.send({
        id: `response-${message.id}`,
        timestamp: Date.now(),
        type: 'response',
        payload: {
          ...response,
          requestId: message.id,
          processingTime
        },
        priority: message.priority || 'normal'
      });

      this.metrics.recordRequest(message.type, processingTime);
    } catch (error) {
      console.error('Error handling message:', error);
      
      await this.transport.send({
        id: `error-${message.id}`,
        timestamp: Date.now(),
        type: 'response',
        payload: {
          error: error.message,
          requestId: message.id
        },
        priority: 'high'
      });
    }
  }

  private async handleCodeRequest(message: any): Promise<any> {
    const { payload } = message;
    
    const edgeResult = await this.edgeWorker.handleRequest(
      new Request(`/api/code/${payload.operation}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    );

    const edgeData = await edgeResult.json();
    
    if (edgeData.cached && edgeData.latency === 0) {
      return edgeData;
    }

    const agentResult = await this.agentSystem.processRequest({
      type: 'analyze',
      data: payload
    });

    const aiResult = await this.aiSystem.process({
      type: payload.operation,
      ...payload,
      agentContext: agentResult
    }, this.getUserLocation(message));

    return {
      ...aiResult,
      agent: agentResult,
      edge: edgeData
    };
  }

  private async handleContextRequest(message: any): Promise<any> {
    const { payload } = message;
    
    const enhanced = await this.edgeWorker.handleRequest(
      new Request('/api/code/context', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    );

    const contextData = await enhanced.json();
    
    const patterns = await this.agentSystem.processRequest({
      type: 'pattern',
      data: contextData
    });

    return {
      context: contextData,
      patterns: patterns.patterns || [],
      suggestions: this.generateContextualSuggestions(contextData, patterns)
    };
  }

  private async handleCommandRequest(message: any): Promise<any> {
    const { payload } = message;
    const command = this.protocol.decode('CodeCommand', payload);
    
    const agentResult = await this.agentSystem.processRequest({
      type: command.type,
      data: command
    });

    const aiResult = await this.aiSystem.process({
      type: command.type,
      context: command.context,
      prompt: command.prompt,
      options: command.options,
      maxLatency: 50
    });

    const response = this.combineResults(agentResult, aiResult);
    
    return this.protocol.encode('CodeResponse', {
      commandId: message.id,
      ...response,
      processingTimeMs: performance.now()
    });
  }

  private combineResults(agentResult: any, aiResult: any): any {
    if (agentResult.consensus) {
      return {
        completion: this.protocol.createCompletion(
          this.mergeCompletions(agentResult.consensus.results, aiResult)
        )
      };
    }

    return aiResult;
  }

  private mergeCompletions(agentResults: any[], aiResult: any): any[] {
    const completions = new Map<string, any>();
    
    agentResults.forEach(result => {
      if (result.analysis?.suggestions) {
        result.analysis.suggestions.forEach((s: any) => {
          completions.set(s.text, {
            ...s,
            score: (s.score || 1) * result.weight
          });
        });
      }
    });

    if (aiResult.completions) {
      aiResult.completions.forEach((c: any) => {
        const existing = completions.get(c.text);
        if (existing) {
          existing.score += c.score || 1;
        } else {
          completions.set(c.text, c);
        }
      });
    }

    return Array.from(completions.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  private generateContextualSuggestions(context: any, patterns: any): string[] {
    const suggestions: string[] = [];
    
    if (context.relatedFiles?.length > 0) {
      suggestions.push(`Found ${context.relatedFiles.length} related files`);
    }
    
    if (patterns.anomalies?.length > 0) {
      suggestions.push(`Detected ${patterns.anomalies.length} anomalies`);
    }
    
    if (patterns.trends?.direction === 'improving') {
      suggestions.push('Code quality is improving');
    }
    
    return suggestions;
  }

  private handleSignal(signal: any): void {
    console.log('Received signal:', signal);
  }

  private handleConsensus(consensus: any): void {
    this.metrics.recordConsensus(consensus.agreement, consensus.confidence);
  }

  private getUserLocation(message: any): string | undefined {
    return message.metadata?.location;
  }

  async handleBrowserConnection(request: any): Promise<void> {
    const connectionId = this.generateConnectionId();
    
    const connection = new Connection(connectionId, {
      transport: this.transport,
      protocol: this.protocol,
      agentSystem: this.agentSystem,
      aiSystem: this.aiSystem
    });

    this.connections.set(connectionId, connection);
    
    connection.on('close', () => {
      this.connections.delete(connectionId);
      this.metrics.recordDisconnection(connectionId);
    });

    await connection.initialize(request);
  }

  private generateConnectionId(): string {
    return `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getMetrics(): any {
    return {
      ...this.metrics.getSummary(),
      connections: this.connections.size,
      agents: this.agentSystem.getSystemStats(),
      ai: this.aiSystem.getSystemStatus(),
      transport: this.transport.getLatencyStats()
    };
  }

  async shutdown(): Promise<void> {
    for (const connection of this.connections.values()) {
      await connection.close();
    }
    
    await this.transport.close();
    console.log('Development Integration Server shut down');
  }
}

class Connection extends EventTarget {
  private active = true;
  private sessionData = new Map<string, any>();

  constructor(
    public id: string,
    private services: {
      transport: HybridTransport;
      protocol: CodeProtocol;
      agentSystem: MultiAgentSystem;
      aiSystem: DistributedAISystem;
    }
  ) {
    super();
  }

  async initialize(request: any): Promise<void> {
    this.sessionData.set('startTime', Date.now());
    this.sessionData.set('userAgent', request.headers['user-agent']);
    
    console.log(`Connection ${this.id} initialized`);
  }

  async close(): Promise<void> {
    this.active = false;
    this.dispatchEvent(new Event('close'));
    console.log(`Connection ${this.id} closed`);
  }

  on(event: string, handler: Function): void {
    this.addEventListener(event, handler as any);
  }
}

class ServerMetrics {
  private connections = { webrtc: 0, webtransport: 0 };
  private latencies: Map<string, number[]> = new Map();
  private requests: Map<string, number[]> = new Map();
  private errors: any[] = [];
  private consensus: { agreement: number[]; confidence: number[] } = {
    agreement: [],
    confidence: []
  };

  recordConnection(type: 'webrtc' | 'webtransport'): void {
    this.connections[type]++;
  }

  recordDisconnection(connectionId: string): void {
    // Track disconnection metrics
  }

  recordLatency(latency: number, source: string): void {
    const latencies = this.latencies.get(source) || [];
    latencies.push(latency);
    
    if (latencies.length > 1000) {
      latencies.shift();
    }
    
    this.latencies.set(source, latencies);
  }

  recordRequest(type: string, processingTime: number): void {
    const times = this.requests.get(type) || [];
    times.push(processingTime);
    
    if (times.length > 1000) {
      times.shift();
    }
    
    this.requests.set(type, times);
  }

  recordError(error: any): void {
    this.errors.push({
      ...error,
      timestamp: Date.now()
    });
    
    if (this.errors.length > 100) {
      this.errors.shift();
    }
  }

  recordConsensus(agreement: number, confidence: number): void {
    this.consensus.agreement.push(agreement);
    this.consensus.confidence.push(confidence);
    
    if (this.consensus.agreement.length > 100) {
      this.consensus.agreement.shift();
      this.consensus.confidence.shift();
    }
  }

  getSummary(): any {
    const latencySummary: any = {};
    
    for (const [source, values] of this.latencies) {
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        latencySummary[source] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          p50: sorted[Math.floor(sorted.length * 0.5)],
          p95: sorted[Math.floor(sorted.length * 0.95)],
          p99: sorted[Math.floor(sorted.length * 0.99)]
        };
      }
    }

    const requestSummary: any = {};
    
    for (const [type, times] of this.requests) {
      if (times.length > 0) {
        requestSummary[type] = {
          count: times.length,
          avgTime: times.reduce((a, b) => a + b, 0) / times.length
        };
      }
    }

    return {
      connections: this.connections,
      latency: latencySummary,
      requests: requestSummary,
      errors: this.errors.length,
      consensus: {
        avgAgreement: this.consensus.agreement.length > 0 ?
          this.consensus.agreement.reduce((a, b) => a + b, 0) / this.consensus.agreement.length : 0,
        avgConfidence: this.consensus.confidence.length > 0 ?
          this.consensus.confidence.reduce((a, b) => a + b, 0) / this.consensus.confidence.length : 0
      }
    };
  }
}