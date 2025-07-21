export class PatternDetector {
  constructor() {
    this.patterns = {
      commits: new Map(),
      files: new Map(),
      errors: new Map(),
      workflows: new Map(),
      timings: new Map()
    };
    
    this.similarityThreshold = 0.7;
  }

  async analyze(eventName, payload, context) {
    const detectedPatterns = [];
    
    switch (eventName) {
      case 'push':
        detectedPatterns.push(...this.analyzePushPatterns(payload, context));
        break;
      case 'pull_request':
        detectedPatterns.push(...this.analyzePRPatterns(payload, context));
        break;
      case 'workflow_run':
        detectedPatterns.push(...this.analyzeWorkflowPatterns(payload, context));
        break;
    }
    
    // Detect time-based patterns
    detectedPatterns.push(...this.analyzeTimePatterns(eventName, context));
    
    // Store patterns for learning
    detectedPatterns.forEach(pattern => {
      const key = `${pattern.type}:${pattern.name}`;
      const existing = this.patterns[pattern.type].get(pattern.name) || { count: 0, instances: [] };
      existing.count++;
      existing.instances.push({
        timestamp: Date.now(),
        context: pattern.context
      });
      
      // Keep only recent instances
      if (existing.instances.length > 100) {
        existing.instances = existing.instances.slice(-100);
      }
      
      this.patterns[pattern.type].set(pattern.name, existing);
    });
    
    return detectedPatterns;
  }

  analyzePushPatterns(payload, context) {
    const patterns = [];
    
    // Detect commit message patterns
    payload.commits.forEach(commit => {
      const messagePattern = this.detectCommitMessagePattern(commit.message);
      if (messagePattern) {
        patterns.push({
          type: 'commits',
          name: messagePattern,
          description: `Common commit pattern: ${messagePattern}`,
          context: { message: commit.message }
        });
      }
    });
    
    // Detect file change patterns
    const changedFiles = payload.commits.flatMap(c => 
      [...c.added, ...c.modified, ...c.removed]
    );
    
    const filePatterns = this.detectFilePatterns(changedFiles);
    patterns.push(...filePatterns.map(fp => ({
      type: 'files',
      name: fp.pattern,
      description: `File pattern: ${fp.description}`,
      context: { files: fp.files }
    })));
    
    // Detect rapid push pattern
    const recentPushes = context.events
      .filter(e => e.name === 'push' && e.timestamp > Date.now() - 10 * 60 * 1000)
      .length;
    
    if (recentPushes > 5) {
      patterns.push({
        type: 'timings',
        name: 'rapid-pushes',
        description: 'Multiple pushes in short time - consider squashing commits',
        context: { count: recentPushes, timeWindow: '10 minutes' }
      });
    }
    
    return patterns;
  }

  analyzePRPatterns(payload, context) {
    const patterns = [];
    const pr = payload.pull_request;
    
    // Detect PR size patterns
    if (pr.additions + pr.deletions > 1000) {
      patterns.push({
        type: 'pull_request',
        name: 'large-pr',
        description: 'Large PR detected - consider breaking into smaller changes',
        context: { additions: pr.additions, deletions: pr.deletions }
      });
    }
    
    // Detect PR title patterns
    const titlePattern = this.detectTitlePattern(pr.title);
    if (titlePattern) {
      patterns.push({
        type: 'pull_request',
        name: `pr-title-${titlePattern}`,
        description: `PR follows ${titlePattern} pattern`,
        context: { title: pr.title }
      });
    }
    
    // Detect quick PR pattern
    if (payload.action === 'opened') {
      const lastCommit = context.commits[context.commits.length - 1];
      if (lastCommit && Date.now() - lastCommit.timestamp < 5 * 60 * 1000) {
        patterns.push({
          type: 'workflows',
          name: 'quick-pr',
          description: 'PR created quickly after commit - good development flow',
          context: { timeSinceCommit: Date.now() - lastCommit.timestamp }
        });
      }
    }
    
    return patterns;
  }

  analyzeWorkflowPatterns(payload, context) {
    const patterns = [];
    const workflow = payload.workflow_run;
    
    // Detect failure patterns
    if (workflow.conclusion === 'failure') {
      const recentFailures = context.events
        .filter(e => 
          e.name === 'workflow_run' && 
          e.timestamp > Date.now() - 60 * 60 * 1000
        )
        .length;
      
      if (recentFailures > 3) {
        patterns.push({
          type: 'workflows',
          name: 'repeated-failures',
          description: 'Multiple workflow failures - check CI configuration',
          context: { failures: recentFailures, workflow: workflow.name }
        });
      }
    }
    
    // Detect slow workflows
    const duration = new Date(workflow.updated_at) - new Date(workflow.created_at);
    if (duration > 10 * 60 * 1000) { // 10 minutes
      patterns.push({
        type: 'workflows',
        name: 'slow-workflow',
        description: 'Workflow taking long time - consider optimization',
        context: { duration, workflow: workflow.name }
      });
    }
    
    return patterns;
  }

  analyzeTimePatterns(eventName, context) {
    const patterns = [];
    const hour = new Date().getHours();
    
    // Track activity by hour
    const hourKey = `hour-${hour}`;
    const hourActivity = this.patterns.timings.get(hourKey) || { count: 0 };
    
    // Detect peak activity times
    if (hourActivity.count > 10) {
      patterns.push({
        type: 'timings',
        name: 'peak-hour',
        description: `High activity during hour ${hour} - optimize for this time`,
        context: { hour, eventCount: hourActivity.count }
      });
    }
    
    // Detect patterns by day of week
    const dayOfWeek = new Date().getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    if (dayOfWeek === 5) { // Friday
      patterns.push({
        type: 'timings',
        name: 'friday-deployment',
        description: 'Friday activity detected - be cautious with deployments',
        context: { day: days[dayOfWeek] }
      });
    }
    
    return patterns;
  }

  detectCommitMessagePattern(message) {
    const patterns = [
      { regex: /^fix:/i, name: 'fix-commit' },
      { regex: /^feat:/i, name: 'feature-commit' },
      { regex: /^docs:/i, name: 'docs-commit' },
      { regex: /^refactor:/i, name: 'refactor-commit' },
      { regex: /^test:/i, name: 'test-commit' },
      { regex: /^wip/i, name: 'wip-commit' },
      { regex: /merge/i, name: 'merge-commit' }
    ];
    
    for (const pattern of patterns) {
      if (pattern.regex.test(message)) {
        return pattern.name;
      }
    }
    
    return null;
  }

  detectFilePatterns(files) {
    const patterns = [];
    
    // Group files by extension
    const extensions = {};
    files.forEach(file => {
      const ext = file.split('.').pop();
      if (!extensions[ext]) extensions[ext] = [];
      extensions[ext].push(file);
    });
    
    // Detect patterns
    Object.entries(extensions).forEach(([ext, fileList]) => {
      if (fileList.length > 3) {
        patterns.push({
          pattern: `multiple-${ext}`,
          description: `Multiple ${ext} files changed`,
          files: fileList
        });
      }
    });
    
    // Detect test file patterns
    const testFiles = files.filter(f => f.includes('test') || f.includes('spec'));
    if (testFiles.length > 0 && testFiles.length < files.length / 2) {
      patterns.push({
        pattern: 'missing-tests',
        description: 'Changes without proportional test coverage',
        files: testFiles
      });
    }
    
    return patterns;
  }

  detectTitlePattern(title) {
    if (title.match(/\[.*\]/)) return 'tagged';
    if (title.match(/^[A-Z]+-\d+/)) return 'jira-style';
    if (title.match(/^(fix|feat|docs|refactor|test):/i)) return 'conventional';
    if (title.match(/^\d+\./)) return 'numbered';
    return null;
  }

  findSimilarIssues(issue) {
    const similar = [];
    const words = this.tokenize(issue.title + ' ' + issue.body);
    
    // This would search through historical issues
    // For demo, return mock data
    return {
      similar: [
        { number: 42, title: 'Similar issue example', similarity: 85 },
        { number: 38, title: 'Related problem', similarity: 72 }
      ].filter(i => i.similarity > 70)
    };
  }

  getSimilarPRs(pullRequest) {
    // This would use more sophisticated similarity matching
    // For demo, return mock data
    return {
      similarPRs: [
        { number: 101, title: 'Similar PR implementation', similarity: 78 },
        { number: 95, title: 'Related feature', similarity: 65 }
      ].filter(pr => pr.similarity > 60)
    };
  }

  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  getPatterns() {
    const summary = {};
    
    // Summarize each pattern type
    this.patterns.commits.forEach((value, key) => {
      if (!summary.commits) summary.commits = {};
      summary.commits[key] = {
        count: value.count,
        lastSeen: value.instances[value.instances.length - 1]?.timestamp || 0
      };
    });
    
    this.patterns.files.forEach((value, key) => {
      if (!summary.files) summary.files = {};
      summary.files[key] = {
        count: value.count,
        frequency: value.count / (value.instances.length || 1)
      };
    });
    
    this.patterns.workflows.forEach((value, key) => {
      if (!summary.workflows) summary.workflows = {};
      summary.workflows[key] = value.count;
    });
    
    // Add detected patterns summary
    summary.detected = {
      totalPatterns: this.patterns.commits.size + this.patterns.files.size + 
                     this.patterns.errors.size + this.patterns.workflows.size,
      mostFrequent: this.getMostFrequentPattern(),
      recentActivity: this.getRecentPatterns()
    };
    
    return summary;
  }
  
  getMostFrequentPattern() {
    let maxCount = 0;
    let mostFrequent = null;
    
    for (const [type, patterns] of Object.entries(this.patterns)) {
      patterns.forEach((value, key) => {
        if (value.count > maxCount) {
          maxCount = value.count;
          mostFrequent = { type, name: key, count: value.count };
        }
      });
    }
    
    return mostFrequent;
  }
  
  getRecentPatterns() {
    const recent = [];
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    for (const [type, patterns] of Object.entries(this.patterns)) {
      patterns.forEach((value, key) => {
        const recentInstances = value.instances.filter(i => i.timestamp > fiveMinutesAgo);
        if (recentInstances.length > 0) {
          recent.push({
            type,
            name: key,
            count: recentInstances.length
          });
        }
      });
    }
    
    return recent.slice(0, 5); // Return top 5 recent patterns
  }
}