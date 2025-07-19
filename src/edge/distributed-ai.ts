import { EdgeWorker } from './edge-worker';

interface ModelConfig {
  id: string;
  type: 'completion' | 'analysis' | 'suggestion';
  size: 'nano' | 'micro' | 'mini';
  location: string;
  capabilities: string[];
  maxLatency: number;
}

interface EdgeNode {
  id: string;
  location: string;
  models: ModelConfig[];
  capacity: number;
  currentLoad: number;
  latency: number;
}

export class DistributedAISystem {
  private edgeNodes = new Map<string, EdgeNode>();
  private modelRegistry = new Map<string, ModelConfig>();
  private routingTable = new Map<string, string>();
  private loadBalancer: LoadBalancer;
  private modelOptimizer: ModelOptimizer;
  
  constructor() {
    this.loadBalancer = new LoadBalancer();
    this.modelOptimizer = new ModelOptimizer();
    this.initializeEdgeNodes();
  }

  private initializeEdgeNodes(): void {
    const regions = ['us-west', 'us-east', 'eu-west', 'ap-south'];
    
    regions.forEach(region => {
      const nodeId = `edge-${region}`;
      this.edgeNodes.set(nodeId, {
        id: nodeId,
        location: region,
        models: this.deployModelsToRegion(region),
        capacity: 1000,
        currentLoad: 0,
        latency: this.estimateLatency(region)
      });
    });
  }

  private deployModelsToRegion(region: string): ModelConfig[] {
    const models: ModelConfig[] = [
      {
        id: `completion-nano-${region}`,
        type: 'completion',
        size: 'nano',
        location: region,
        capabilities: ['basic-completion', 'syntax-aware'],
        maxLatency: 20
      },
      {
        id: `analysis-micro-${region}`,
        type: 'analysis',
        size: 'micro',
        location: region,
        capabilities: ['ast-parsing', 'pattern-detection'],
        maxLatency: 50
      },
      {
        id: `suggestion-mini-${region}`,
        type: 'suggestion',
        size: 'mini',
        location: region,
        capabilities: ['context-aware', 'multi-file'],
        maxLatency: 100
      }
    ];

    models.forEach(model => {
      this.modelRegistry.set(model.id, model);
    });

    return models;
  }

  async process(request: any, userLocation?: string): Promise<any> {
    const startTime = performance.now();
    
    const optimalNode = this.selectOptimalNode(request, userLocation);
    const model = this.selectModel(request, optimalNode);
    
    if (!model) {
      throw new Error('No suitable model found for request');
    }

    const preprocessed = await this.preprocessRequest(request, model);
    const result = await this.executeOnEdge(optimalNode, model, preprocessed);
    const postprocessed = await this.postprocessResult(result, request);

    const totalLatency = performance.now() - startTime;
    this.updateMetrics(optimalNode.id, model.id, totalLatency);

    return {
      ...postprocessed,
      metadata: {
        nodeId: optimalNode.id,
        modelId: model.id,
        latency: totalLatency,
        cached: result.cached || false
      }
    };
  }

  private selectOptimalNode(request: any, userLocation?: string): EdgeNode {
    const nodes = Array.from(this.edgeNodes.values());
    
    if (userLocation) {
      nodes.sort((a, b) => {
        const distA = this.calculateDistance(userLocation, a.location);
        const distB = this.calculateDistance(userLocation, b.location);
        return distA - distB;
      });
    }

    const suitable = nodes.filter(node => 
      node.currentLoad < node.capacity * 0.8 &&
      node.latency < request.maxLatency || 100
    );

    if (suitable.length === 0) {
      return nodes[0];
    }

    return this.loadBalancer.select(suitable, request);
  }

  private selectModel(request: any, node: EdgeNode): ModelConfig | null {
    const requiredCapabilities = this.determineRequiredCapabilities(request);
    
    const suitable = node.models.filter(model =>
      model.type === request.type &&
      requiredCapabilities.every(cap => model.capabilities.includes(cap)) &&
      model.maxLatency <= (request.maxLatency || 100)
    );

    if (suitable.length === 0) return null;

    return suitable.reduce((best, current) => {
      const bestScore = this.scoreModel(best, request);
      const currentScore = this.scoreModel(current, request);
      return currentScore > bestScore ? current : best;
    });
  }

  private determineRequiredCapabilities(request: any): string[] {
    const capabilities: string[] = [];
    
    if (request.type === 'completion') {
      capabilities.push('basic-completion');
      if (request.syntaxAware) capabilities.push('syntax-aware');
    }
    
    if (request.type === 'analysis') {
      capabilities.push('ast-parsing');
      if (request.detectPatterns) capabilities.push('pattern-detection');
    }
    
    if (request.type === 'suggestion') {
      capabilities.push('context-aware');
      if (request.multiFile) capabilities.push('multi-file');
    }
    
    return capabilities;
  }

  private scoreModel(model: ModelConfig, request: any): number {
    let score = 100;
    
    score -= (model.maxLatency / 10);
    
    const sizeScore = { nano: 30, micro: 20, mini: 10 };
    score += sizeScore[model.size];
    
    const extraCapabilities = model.capabilities.filter(cap =>
      !this.determineRequiredCapabilities(request).includes(cap)
    );
    score += extraCapabilities.length * 5;
    
    return score;
  }

  private async preprocessRequest(request: any, model: ModelConfig): Promise<any> {
    const optimized = this.modelOptimizer.optimize(request, model);
    
    if (model.size === 'nano') {
      return this.simplifyForNanoModel(optimized);
    }
    
    return optimized;
  }

  private simplifyForNanoModel(request: any): any {
    return {
      ...request,
      context: request.context ? this.truncateContext(request.context) : undefined,
      maxTokens: Math.min(request.maxTokens || 100, 100)
    };
  }

  private truncateContext(context: any): any {
    if (typeof context === 'string') {
      return context.substring(0, 500);
    }
    
    if (Array.isArray(context)) {
      return context.slice(0, 5);
    }
    
    return context;
  }

  private async executeOnEdge(node: EdgeNode, model: ModelConfig, request: any): Promise<any> {
    node.currentLoad++;
    
    try {
      const endpoint = `https://${node.location}.edge.ai/v1/inference`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Model-ID': model.id
        },
        body: JSON.stringify(request)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Edge execution failed on ${node.id}:`, error);
      throw error;
    } finally {
      node.currentLoad--;
    }
  }

  private async postprocessResult(result: any, originalRequest: any): Promise<any> {
    if (originalRequest.type === 'completion') {
      return this.enhanceCompletions(result, originalRequest);
    }
    
    if (originalRequest.type === 'analysis') {
      return this.enrichAnalysis(result, originalRequest);
    }
    
    return result;
  }

  private enhanceCompletions(result: any, request: any): any {
    const enhanced = { ...result };
    
    if (result.completions && request.rankByRelevance) {
      enhanced.completions = this.rankCompletions(result.completions, request.context);
    }
    
    return enhanced;
  }

  private rankCompletions(completions: any[], context: any): any[] {
    return completions.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, context);
      const scoreB = this.calculateRelevanceScore(b, context);
      return scoreB - scoreA;
    });
  }

  private calculateRelevanceScore(completion: any, context: any): number {
    let score = completion.confidence || 0.5;
    
    if (context && completion.text) {
      const contextWords = new Set(context.split(/\s+/));
      const completionWords = completion.text.split(/\s+/);
      const overlap = completionWords.filter(w => contextWords.has(w)).length;
      score += overlap * 0.1;
    }
    
    return score;
  }

  private enrichAnalysis(result: any, request: any): any {
    return {
      ...result,
      enriched: true,
      timestamp: Date.now()
    };
  }

  private calculateDistance(loc1: string, loc2: string): number {
    const distances: Record<string, Record<string, number>> = {
      'us-west': { 'us-west': 0, 'us-east': 50, 'eu-west': 150, 'ap-south': 200 },
      'us-east': { 'us-west': 50, 'us-east': 0, 'eu-west': 100, 'ap-south': 250 },
      'eu-west': { 'us-west': 150, 'us-east': 100, 'eu-west': 0, 'ap-south': 150 },
      'ap-south': { 'us-west': 200, 'us-east': 250, 'eu-west': 150, 'ap-south': 0 }
    };
    
    return distances[loc1]?.[loc2] || 1000;
  }

  private estimateLatency(region: string): number {
    const baseLatencies: Record<string, number> = {
      'us-west': 10,
      'us-east': 15,
      'eu-west': 25,
      'ap-south': 35
    };
    
    return baseLatencies[region] || 50;
  }

  private updateMetrics(nodeId: string, modelId: string, latency: number): void {
    const node = this.edgeNodes.get(nodeId);
    if (node) {
      node.latency = node.latency * 0.9 + latency * 0.1;
    }
  }

  async warmupModels(): Promise<void> {
    const warmupRequests = [
      { type: 'completion', text: 'function', maxLatency: 50 },
      { type: 'analysis', code: 'const x = 1;', maxLatency: 100 },
      { type: 'suggestion', context: 'import', maxLatency: 150 }
    ];

    const promises = warmupRequests.map(req => 
      this.process(req).catch(err => 
        console.warn('Warmup failed:', err)
      )
    );

    await Promise.all(promises);
  }

  getSystemStatus(): any {
    const nodes = Array.from(this.edgeNodes.values()).map(node => ({
      id: node.id,
      location: node.location,
      load: `${(node.currentLoad / node.capacity * 100).toFixed(1)}%`,
      latency: `${node.latency.toFixed(1)}ms`,
      models: node.models.length
    }));

    const totalCapacity = Array.from(this.edgeNodes.values())
      .reduce((sum, node) => sum + node.capacity, 0);
    
    const totalLoad = Array.from(this.edgeNodes.values())
      .reduce((sum, node) => sum + node.currentLoad, 0);

    return {
      nodes,
      totalModels: this.modelRegistry.size,
      systemLoad: `${(totalLoad / totalCapacity * 100).toFixed(1)}%`,
      optimalLatency: this.calculateOptimalLatency()
    };
  }

  private calculateOptimalLatency(): string {
    const latencies = Array.from(this.edgeNodes.values())
      .map(node => node.latency);
    
    const min = Math.min(...latencies);
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    
    return `${min.toFixed(1)}-${avg.toFixed(1)}ms`;
  }
}

class LoadBalancer {
  private requestHistory = new Map<string, number[]>();

  select(nodes: EdgeNode[], request: any): EdgeNode {
    const scores = nodes.map(node => ({
      node,
      score: this.calculateScore(node, request)
    }));

    scores.sort((a, b) => b.score - a.score);
    return scores[0].node;
  }

  private calculateScore(node: EdgeNode, request: any): number {
    let score = 100;
    
    const loadPercentage = node.currentLoad / node.capacity;
    score -= loadPercentage * 50;
    
    score -= node.latency * 0.5;
    
    const hasAllCapabilities = node.models.some(m => 
      m.type === request.type
    );
    if (!hasAllCapabilities) score -= 20;
    
    const history = this.requestHistory.get(node.id) || [];
    const recentRequests = history.filter(t => Date.now() - t < 60000).length;
    score -= recentRequests * 2;
    
    return score;
  }

  recordRequest(nodeId: string): void {
    const history = this.requestHistory.get(nodeId) || [];
    history.push(Date.now());
    
    if (history.length > 100) {
      history.shift();
    }
    
    this.requestHistory.set(nodeId, history);
  }
}

class ModelOptimizer {
  optimize(request: any, model: ModelConfig): any {
    const optimized = { ...request };
    
    if (model.size === 'nano') {
      optimized.maxTokens = Math.min(request.maxTokens || 50, 50);
      optimized.temperature = 0.3;
    } else if (model.size === 'micro') {
      optimized.maxTokens = Math.min(request.maxTokens || 150, 150);
      optimized.temperature = request.temperature || 0.5;
    }
    
    if (request.context && typeof request.context === 'string') {
      optimized.context = this.optimizeContext(request.context, model);
    }
    
    return optimized;
  }

  private optimizeContext(context: string, model: ModelConfig): string {
    const maxLength = model.size === 'nano' ? 200 : 
                     model.size === 'micro' ? 500 : 1000;
    
    if (context.length <= maxLength) return context;
    
    const lines = context.split('\n');
    const importantLines = lines.filter(line => 
      line.includes('function') ||
      line.includes('class') ||
      line.includes('const') ||
      line.includes('let') ||
      line.includes('import')
    );
    
    const optimized = importantLines.join('\n').substring(0, maxLength);
    return optimized || context.substring(0, maxLength);
  }
}