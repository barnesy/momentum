// GitHub Decision Tracking System
// Tracks and analyzes development decisions made through GitHub

export class DecisionTracker {
  constructor() {
    this.decisions = new Map();
    this.decisionTypes = {
      ARCHITECTURE: 'architecture',
      FEATURE: 'feature',
      BUGFIX: 'bugfix',
      REFACTOR: 'refactor',
      DEPENDENCY: 'dependency',
      SECURITY: 'security',
      PERFORMANCE: 'performance',
      DOCUMENTATION: 'documentation'
    };
    
    this.decisionSources = {
      PR_DESCRIPTION: 'pull_request',
      ISSUE_COMMENT: 'issue_comment',
      COMMIT_MESSAGE: 'commit_message',
      REVIEW_COMMENT: 'review_comment',
      DISCUSSION: 'discussion'
    };
  }

  // Extract decision from GitHub event
  async extractDecision(event, payload) {
    const decision = {
      id: this.generateDecisionId(event, payload),
      timestamp: Date.now(),
      source: this.identifySource(event),
      type: null,
      title: null,
      description: null,
      rationale: null,
      alternatives: [],
      impacts: [],
      participants: [],
      status: 'proposed',
      metadata: {}
    };

    switch (event) {
      case 'pull_request':
        return this.extractFromPR(payload, decision);
      case 'issues':
        return this.extractFromIssue(payload, decision);
      case 'issue_comment':
        return this.extractFromComment(payload, decision);
      case 'pull_request_review':
        return this.extractFromReview(payload, decision);
      default:
        return null;
    }
  }

  // Extract decision from Pull Request
  extractFromPR(payload, decision) {
    const pr = payload.pull_request;
    const body = pr.body || '';
    
    // Look for decision markers
    const decisionMatch = body.match(/## Decision[\s\S]*?(?=##|$)/i);
    if (!decisionMatch) return null;
    
    decision.title = pr.title;
    decision.type = this.classifyDecisionType(pr.title + ' ' + body);
    decision.participants = [pr.user.login];
    
    // Extract rationale
    const rationaleMatch = body.match(/### (?:Rationale|Why)[\s\S]*?(?=###|$)/i);
    if (rationaleMatch) {
      decision.rationale = rationaleMatch[0].replace(/### (?:Rationale|Why)/i, '').trim();
    }
    
    // Extract alternatives
    const alternativesMatch = body.match(/### Alternatives[\s\S]*?(?=###|$)/i);
    if (alternativesMatch) {
      const altText = alternativesMatch[0].replace(/### Alternatives/i, '').trim();
      decision.alternatives = this.parseAlternatives(altText);
    }
    
    // Extract impacts
    const impactsMatch = body.match(/### (?:Impact|Consequences)[\s\S]*?(?=###|$)/i);
    if (impactsMatch) {
      decision.impacts = this.parseImpacts(impactsMatch[0]);
    }
    
    decision.metadata = {
      pr_number: pr.number,
      pr_url: pr.html_url,
      files_changed: pr.changed_files,
      additions: pr.additions,
      deletions: pr.deletions
    };
    
    return decision;
  }

  // Extract decision from Issue
  extractFromIssue(payload, decision) {
    const issue = payload.issue;
    const body = issue.body || '';
    
    // Check if this is a decision issue (by label or title pattern)
    const hasDecisionLabel = issue.labels.some(l => 
      l.name.toLowerCase().includes('decision') || 
      l.name.toLowerCase().includes('adr')
    );
    
    if (!hasDecisionLabel && !issue.title.toLowerCase().includes('decision')) {
      return null;
    }
    
    decision.title = issue.title;
    decision.description = body;
    decision.type = this.classifyDecisionType(issue.title + ' ' + body);
    decision.participants = [issue.user.login];
    decision.status = issue.state === 'closed' ? 'accepted' : 'proposed';
    
    decision.metadata = {
      issue_number: issue.number,
      issue_url: issue.html_url,
      labels: issue.labels.map(l => l.name)
    };
    
    return decision;
  }

  // Extract from comments
  extractFromComment(payload, decision) {
    const comment = payload.comment;
    const body = comment.body || '';
    
    // Look for decision keywords
    if (!body.match(/decision:|decided:|approve:|consensus:/i)) {
      return null;
    }
    
    decision.title = `Decision in ${payload.issue ? 'issue' : 'PR'} #${payload.issue?.number || payload.pull_request?.number}`;
    decision.description = body;
    decision.type = this.classifyDecisionType(body);
    decision.participants = [comment.user.login];
    
    // Check for approval patterns
    if (body.match(/approved|lgtm|:shipit:|👍|✅/i)) {
      decision.status = 'accepted';
    }
    
    return decision;
  }

  // Extract from PR reviews
  extractFromReview(payload, decision) {
    const review = payload.review;
    
    if (review.state !== 'approved' && review.state !== 'changes_requested') {
      return null;
    }
    
    decision.title = `Review decision on PR #${payload.pull_request.number}`;
    decision.description = review.body;
    decision.type = review.state === 'approved' ? this.decisionTypes.FEATURE : this.decisionTypes.REFACTOR;
    decision.participants = [review.user.login];
    decision.status = review.state === 'approved' ? 'accepted' : 'rejected';
    
    decision.metadata = {
      pr_number: payload.pull_request.number,
      review_state: review.state
    };
    
    return decision;
  }

  // Classify decision type based on content
  classifyDecisionType(text) {
    const lower = text.toLowerCase();
    
    if (lower.match(/architect|design|structure|pattern/)) {
      return this.decisionTypes.ARCHITECTURE;
    } else if (lower.match(/feature|add|implement|new/)) {
      return this.decisionTypes.FEATURE;
    } else if (lower.match(/bug|fix|issue|problem/)) {
      return this.decisionTypes.BUGFIX;
    } else if (lower.match(/refactor|improve|optimize|clean/)) {
      return this.decisionTypes.REFACTOR;
    } else if (lower.match(/dependency|package|library|upgrade/)) {
      return this.decisionTypes.DEPENDENCY;
    } else if (lower.match(/security|vulnerab|cve|auth/)) {
      return this.decisionTypes.SECURITY;
    } else if (lower.match(/performance|speed|optimize|fast/)) {
      return this.decisionTypes.PERFORMANCE;
    } else if (lower.match(/doc|readme|comment|guide/)) {
      return this.decisionTypes.DOCUMENTATION;
    }
    
    return this.decisionTypes.FEATURE; // default
  }

  // Parse alternatives from text
  parseAlternatives(text) {
    const alternatives = [];
    const lines = text.split('\n');
    
    let current = null;
    lines.forEach(line => {
      if (line.match(/^\d+\.|^-|^\*/)) {
        if (current) alternatives.push(current);
        current = { description: line.replace(/^\d+\.|^-|^\*/, '').trim(), pros: [], cons: [] };
      } else if (current && line.match(/pros?:/i)) {
        current.pros.push(line.replace(/pros?:/i, '').trim());
      } else if (current && line.match(/cons?:/i)) {
        current.cons.push(line.replace(/cons?:/i, '').trim());
      }
    });
    
    if (current) alternatives.push(current);
    return alternatives;
  }

  // Parse impacts
  parseImpacts(text) {
    const impacts = [];
    const categories = {
      performance: /performance|speed|latency/i,
      security: /security|auth|vulnerab/i,
      ux: /user experience|ux|usability/i,
      maintenance: /maintenance|technical debt|complexity/i,
      compatibility: /compatibility|breaking change/i
    };
    
    Object.entries(categories).forEach(([category, pattern]) => {
      if (text.match(pattern)) {
        impacts.push(category);
      }
    });
    
    return impacts;
  }

  // Store decision
  storeDecision(decision) {
    if (!decision || !decision.id) return;
    
    this.decisions.set(decision.id, decision);
    
    // Emit event for real-time updates
    this.emit('decision:stored', decision);
  }

  // Get decision history
  getDecisionHistory(filters = {}) {
    let decisions = Array.from(this.decisions.values());
    
    // Apply filters
    if (filters.type) {
      decisions = decisions.filter(d => d.type === filters.type);
    }
    
    if (filters.status) {
      decisions = decisions.filter(d => d.status === filters.status);
    }
    
    if (filters.participant) {
      decisions = decisions.filter(d => d.participants.includes(filters.participant));
    }
    
    if (filters.since) {
      decisions = decisions.filter(d => d.timestamp > filters.since);
    }
    
    // Sort by timestamp descending
    decisions.sort((a, b) => b.timestamp - a.timestamp);
    
    return decisions;
  }

  // Get decision analytics
  getAnalytics() {
    const decisions = Array.from(this.decisions.values());
    
    const analytics = {
      total: decisions.length,
      byType: {},
      byStatus: {},
      bySource: {},
      participants: new Set(),
      avgTimeToDecision: 0,
      impactAnalysis: {},
      timeline: []
    };
    
    // Count by type
    Object.values(this.decisionTypes).forEach(type => {
      analytics.byType[type] = decisions.filter(d => d.type === type).length;
    });
    
    // Count by status
    ['proposed', 'accepted', 'rejected', 'superseded'].forEach(status => {
      analytics.byStatus[status] = decisions.filter(d => d.status === status).length;
    });
    
    // Count by source
    Object.values(this.decisionSources).forEach(source => {
      analytics.bySource[source] = decisions.filter(d => d.source === source).length;
    });
    
    // Collect participants
    decisions.forEach(d => {
      d.participants.forEach(p => analytics.participants.add(p));
    });
    
    // Impact analysis
    const allImpacts = decisions.flatMap(d => d.impacts);
    allImpacts.forEach(impact => {
      analytics.impactAnalysis[impact] = (analytics.impactAnalysis[impact] || 0) + 1;
    });
    
    // Timeline (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentDecisions = decisions.filter(d => d.timestamp > thirtyDaysAgo);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      
      analytics.timeline.unshift({
        date: new Date(dayStart).toISOString().split('T')[0],
        count: recentDecisions.filter(d => d.timestamp >= dayStart && d.timestamp < dayEnd).length
      });
    }
    
    analytics.participants = Array.from(analytics.participants);
    
    return analytics;
  }

  // Generate decision report
  generateReport(format = 'markdown') {
    const analytics = this.getAnalytics();
    const decisions = this.getDecisionHistory({ since: Date.now() - 30 * 24 * 60 * 60 * 1000 });
    
    if (format === 'markdown') {
      return `# Decision Tracking Report

Generated: ${new Date().toISOString()}

## Summary
- Total Decisions: ${analytics.total}
- Active Participants: ${analytics.participants.length}
- Accepted Decisions: ${analytics.byStatus.accepted}
- Pending Decisions: ${analytics.byStatus.proposed}

## Decisions by Type
${Object.entries(analytics.byType).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

## Recent Decisions (Last 30 days)
${decisions.slice(0, 10).map(d => `
### ${d.title}
- Type: ${d.type}
- Status: ${d.status}
- Date: ${new Date(d.timestamp).toLocaleDateString()}
- Participants: ${d.participants.join(', ')}
${d.rationale ? `- Rationale: ${d.rationale}` : ''}
`).join('\n')}

## Impact Analysis
${Object.entries(analytics.impactAnalysis).map(([impact, count]) => `- ${impact}: ${count} decisions`).join('\n')}
`;
    }
    
    return analytics; // Return raw data for other formats
  }

  // Helper methods
  generateDecisionId(event, payload) {
    const timestamp = Date.now();
    const repo = payload.repository?.full_name || 'unknown';
    const eventId = payload.pull_request?.number || payload.issue?.number || timestamp;
    return `${repo}-${event}-${eventId}-${timestamp}`;
  }

  identifySource(event) {
    const sourceMap = {
      'pull_request': this.decisionSources.PR_DESCRIPTION,
      'issues': this.decisionSources.ISSUE_COMMENT,
      'issue_comment': this.decisionSources.ISSUE_COMMENT,
      'pull_request_review': this.decisionSources.REVIEW_COMMENT
    };
    
    return sourceMap[event] || 'unknown';
  }

  // Event emitter functionality
  emit(event, data) {
    // This would integrate with your event system
    if (global.eventEmitter) {
      global.eventEmitter.emit(event, data);
    }
  }
}