import { ContextVersioning } from './context-versioning.js';

export class ContextManager {
  constructor() {
    this.context = {
      events: [],
      files: new Map(),
      commits: [],
      issues: new Map(),
      pullRequests: new Map(),
      discussions: new Map(),
      patterns: new Map(),
      metrics: {
        eventCounts: new Map(),
        velocityTrend: [],
        lastUpdated: Date.now()
      }
    };
    
    this.maxEvents = 1000;
    this.maxCommits = 100;
    this.versioning = new ContextVersioning();
    
    // Create initial version
    this.versioning.createVersion(this.context, {
      source: 'initialization',
      description: 'Initial context state'
    });
  }

  async processEvent(eventName, payload) {
    const timestamp = Date.now();
    
    // Record event
    this.context.events.push({
      name: eventName,
      timestamp,
      repository: payload.repository?.full_name,
      actor: payload.sender?.login
    });
    
    // Trim old events
    if (this.context.events.length > this.maxEvents) {
      this.context.events = this.context.events.slice(-this.maxEvents);
    }
    
    // Update event counts
    const count = this.context.metrics.eventCounts.get(eventName) || 0;
    this.context.metrics.eventCounts.set(eventName, count + 1);
    
    // Process specific event types
    switch (eventName) {
      case 'push':
        this.processPush(payload);
        break;
      case 'pull_request':
        this.processPullRequest(payload);
        break;
      case 'issues':
        this.processIssue(payload);
        break;
      case 'discussion':
        this.processDiscussion(payload);
        break;
    }
    
    // Update velocity metrics
    this.updateVelocityMetrics();
    
    this.context.metrics.lastUpdated = timestamp;
    
    // Create version on significant events
    if (this.shouldCreateVersion(eventName)) {
      this.createVersion({
        source: 'event',
        event: eventName,
        repository: payload.repository?.full_name,
        actor: payload.sender?.login
      });
    }
    
    return this.getSnapshot();
  }

  processPush(payload) {
    // Add commits to context
    payload.commits.forEach(commit => {
      this.context.commits.push({
        sha: commit.id,
        message: commit.message,
        author: commit.author.name,
        timestamp: new Date(commit.timestamp).getTime(),
        files: commit.added.concat(commit.modified, commit.removed)
      });
    });
    
    // Update file change frequency
    payload.commits.forEach(commit => {
      [...commit.added, ...commit.modified].forEach(file => {
        const fileData = this.context.files.get(file) || { changes: 0, lastModified: 0 };
        fileData.changes++;
        fileData.lastModified = Date.now();
        this.context.files.set(file, fileData);
      });
    });
    
    // Trim old commits
    if (this.context.commits.length > this.maxCommits) {
      this.context.commits = this.context.commits.slice(-this.maxCommits);
    }
  }

  processPullRequest(payload) {
    const pr = {
      number: payload.pull_request.number,
      title: payload.pull_request.title,
      state: payload.pull_request.state,
      author: payload.pull_request.user.login,
      created: new Date(payload.pull_request.created_at).getTime(),
      updated: new Date(payload.pull_request.updated_at).getTime(),
      files: payload.pull_request.changed_files,
      additions: payload.pull_request.additions,
      deletions: payload.pull_request.deletions
    };
    
    if (payload.action === 'closed' && payload.pull_request.merged) {
      pr.merged = true;
      pr.mergedAt = Date.now();
      pr.timeToMerge = pr.mergedAt - pr.created;
    }
    
    this.context.pullRequests.set(pr.number, pr);
  }

  processIssue(payload) {
    const issue = {
      number: payload.issue.number,
      title: payload.issue.title,
      state: payload.issue.state,
      author: payload.issue.user.login,
      created: new Date(payload.issue.created_at).getTime(),
      updated: new Date(payload.issue.updated_at).getTime(),
      labels: payload.issue.labels.map(l => l.name)
    };
    
    if (payload.action === 'closed') {
      issue.closed = true;
      issue.closedAt = Date.now();
      issue.timeToClose = issue.closedAt - issue.created;
    }
    
    this.context.issues.set(issue.number, issue);
  }

  processDiscussion(payload) {
    const discussion = {
      number: payload.discussion.number,
      title: payload.discussion.title,
      category: payload.discussion.category.name,
      author: payload.discussion.user.login,
      created: new Date(payload.discussion.created_at).getTime(),
      updated: new Date(payload.discussion.updated_at).getTime()
    };
    
    this.context.discussions.set(discussion.number, discussion);
  }

  updateVelocityMetrics() {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    
    // Calculate events per hour
    const recentEvents = this.context.events.filter(e => e.timestamp > hourAgo);
    const eventsPerHour = recentEvents.length;
    
    // Calculate average PR merge time
    const mergedPRs = Array.from(this.context.pullRequests.values())
      .filter(pr => pr.merged && pr.mergedAt > hourAgo);
    
    const avgMergeTime = mergedPRs.length > 0
      ? mergedPRs.reduce((sum, pr) => sum + pr.timeToMerge, 0) / mergedPRs.length
      : 0;
    
    // Calculate issue resolution time
    const closedIssues = Array.from(this.context.issues.values())
      .filter(issue => issue.closed && issue.closedAt > hourAgo);
    
    const avgIssueTime = closedIssues.length > 0
      ? closedIssues.reduce((sum, issue) => sum + issue.timeToClose, 0) / closedIssues.length
      : 0;
    
    this.context.metrics.velocityTrend.push({
      timestamp: now,
      eventsPerHour,
      avgMergeTime,
      avgIssueTime,
      activePRs: Array.from(this.context.pullRequests.values()).filter(pr => pr.state === 'open').length,
      activeIssues: Array.from(this.context.issues.values()).filter(issue => issue.state === 'open').length
    });
    
    // Keep only last 24 hours of velocity data
    const dayAgo = now - 24 * 60 * 60 * 1000;
    this.context.metrics.velocityTrend = this.context.metrics.velocityTrend
      .filter(v => v.timestamp > dayAgo);
  }

  getSnapshot() {
    return {
      summary: {
        totalEvents: this.context.events.length,
        totalCommits: this.context.commits.length,
        activeFiles: this.context.files.size,
        openPRs: Array.from(this.context.pullRequests.values()).filter(pr => pr.state === 'open').length,
        openIssues: Array.from(this.context.issues.values()).filter(issue => issue.state === 'open').length
      },
      recentActivity: this.context.events.slice(-10),
      hotFiles: this.getHotFiles(),
      velocity: this.getCurrentVelocity(),
      patterns: Array.from(this.context.patterns.entries()).slice(-10)
    };
  }

  getHotFiles() {
    return Array.from(this.context.files.entries())
      .sort((a, b) => b[1].changes - a[1].changes)
      .slice(0, 10)
      .map(([path, data]) => ({ path, ...data }));
  }

  getCurrentVelocity() {
    const latest = this.context.metrics.velocityTrend[this.context.metrics.velocityTrend.length - 1];
    return latest || {
      eventsPerHour: 0,
      avgMergeTime: 0,
      avgIssueTime: 0,
      activePRs: 0,
      activeIssues: 0
    };
  }

  getCurrentContext() {
    return this.context;
  }
  
  // Create a version checkpoint
  createVersion(metadata = {}) {
    return this.versioning.createVersion(this.context, {
      ...metadata,
      timestamp: Date.now()
    });
  }
  
  // Get version history
  getVersionHistory(limit = 50) {
    return this.versioning.getHistory(null, limit);
  }
  
  // Rollback to a specific version
  rollbackToVersion(versionId) {
    const version = this.versioning.rollback(versionId);
    this.context = version.context;
    return version;
  }
  
  // Compare versions
  compareVersions(versionId1, versionId2) {
    return this.versioning.compareVersions(versionId1, versionId2);
  }
  
  // Get version analytics
  getVersionAnalytics() {
    const history = this.versioning.getHistory();
    const totalVersions = history.length;
    const recentVersions = history.filter(v => v.timestamp > Date.now() - 24 * 60 * 60 * 1000);
    
    return {
      totalVersions,
      versionsToday: recentVersions.length,
      averageVersionSize: history.reduce((sum, v) => sum + (v.deltaSize || 0), 0) / totalVersions,
      branches: Array.from(this.versioning.branches.keys()),
      currentBranch: this.versioning.activeBranch
    };
  }
  
  // Determine if event should trigger versioning
  shouldCreateVersion(eventName) {
    const significantEvents = [
      'push',
      'pull_request',
      'release',
      'deployment',
      'repository',
      'milestone'
    ];
    
    return significantEvents.includes(eventName);
  }

  getRelevantContext(pullRequest) {
    // Find related commits
    const recentCommits = this.context.commits
      .filter(c => c.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000)
      .slice(-10);
    
    // Find related files
    const relatedFiles = [];
    this.context.files.forEach((data, path) => {
      if (data.lastModified > Date.now() - 24 * 60 * 60 * 1000) {
        relatedFiles.push({ path, ...data });
      }
    });
    
    // Calculate metrics
    const metrics = {
      avgPRTime: this.calculateAveragePRTime(),
      mergeRate: this.calculateMergeRate(),
      avgReviewTime: this.calculateAverageReviewTime()
    };
    
    return {
      recentCommits,
      relatedFiles: relatedFiles.slice(0, 10),
      metrics
    };
  }

  calculateAveragePRTime() {
    const mergedPRs = Array.from(this.context.pullRequests.values())
      .filter(pr => pr.merged);
    
    if (mergedPRs.length === 0) return 'N/A';
    
    const avgMs = mergedPRs.reduce((sum, pr) => sum + pr.timeToMerge, 0) / mergedPRs.length;
    const hours = Math.round(avgMs / (1000 * 60 * 60));
    
    return `${hours}h`;
  }

  calculateMergeRate() {
    const allPRs = Array.from(this.context.pullRequests.values());
    const mergedPRs = allPRs.filter(pr => pr.merged);
    
    if (allPRs.length === 0) return 0;
    
    return Math.round((mergedPRs.length / allPRs.length) * 100);
  }

  calculateAverageReviewTime() {
    // Simplified for demo - would need review event tracking
    return '2.5h';
  }
}