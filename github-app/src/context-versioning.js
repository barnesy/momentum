// Context Versioning System
// Tracks context changes over time with rollback capabilities

import crypto from 'crypto';

export class ContextVersioning {
  constructor(maxVersions = 100) {
    this.versions = new Map();
    this.versionChain = [];
    this.maxVersions = maxVersions;
    this.currentVersion = null;
    this.branches = new Map();
    this.activeBranch = 'main';
  }

  // Create a new version
  createVersion(context, metadata = {}) {
    const version = {
      id: this.generateVersionId(),
      timestamp: Date.now(),
      context: this.cloneContext(context),
      metadata: {
        ...metadata,
        branch: this.activeBranch,
        parent: this.currentVersion
      },
      checksum: this.calculateChecksum(context),
      delta: null
    };

    // Calculate delta from previous version
    if (this.currentVersion && this.versions.has(this.currentVersion)) {
      const previousVersion = this.versions.get(this.currentVersion);
      version.delta = this.calculateDelta(previousVersion.context, context);
      version.deltaSize = JSON.stringify(version.delta).length;
    }

    // Store version
    this.versions.set(version.id, version);
    this.versionChain.push(version.id);
    this.currentVersion = version.id;

    // Update branch
    if (!this.branches.has(this.activeBranch)) {
      this.branches.set(this.activeBranch, []);
    }
    this.branches.get(this.activeBranch).push(version.id);

    // Cleanup old versions
    this.cleanup();

    return version;
  }

  // Calculate delta between two contexts
  calculateDelta(oldContext, newContext) {
    const delta = {
      added: {},
      modified: {},
      deleted: []
    };

    // Find added and modified properties
    this.traverseObject(newContext, '', (path, value) => {
      const oldValue = this.getValueByPath(oldContext, path);
      if (oldValue === undefined) {
        delta.added[path] = value;
      } else if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
        delta.modified[path] = {
          old: oldValue,
          new: value
        };
      }
    });

    // Find deleted properties
    this.traverseObject(oldContext, '', (path, value) => {
      const newValue = this.getValueByPath(newContext, path);
      if (newValue === undefined) {
        delta.deleted.push(path);
      }
    });

    return delta;
  }

  // Apply delta to a context
  applyDelta(context, delta) {
    const newContext = this.cloneContext(context);

    // Apply additions
    Object.entries(delta.added || {}).forEach(([path, value]) => {
      this.setValueByPath(newContext, path, value);
    });

    // Apply modifications
    Object.entries(delta.modified || {}).forEach(([path, change]) => {
      this.setValueByPath(newContext, path, change.new);
    });

    // Apply deletions
    (delta.deleted || []).forEach(path => {
      this.deleteValueByPath(newContext, path);
    });

    return newContext;
  }

  // Get a specific version
  getVersion(versionId) {
    if (!this.versions.has(versionId)) {
      throw new Error(`Version ${versionId} not found`);
    }

    const version = this.versions.get(versionId);
    
    // If we only stored delta, reconstruct full context
    if (version.delta && !version.context) {
      version.context = this.reconstructContext(versionId);
    }

    return version;
  }

  // Get current version
  getCurrentVersion() {
    return this.currentVersion ? this.getVersion(this.currentVersion) : null;
  }

  // Rollback to a specific version
  rollback(versionId) {
    const version = this.getVersion(versionId);
    
    // Create a new version pointing to the rollback
    const rollbackVersion = this.createVersion(version.context, {
      rollbackFrom: this.currentVersion,
      rollbackTo: versionId,
      reason: 'manual rollback'
    });

    return rollbackVersion;
  }

  // Create a new branch
  createBranch(branchName, fromVersion = null) {
    if (this.branches.has(branchName)) {
      throw new Error(`Branch ${branchName} already exists`);
    }

    const startVersion = fromVersion || this.currentVersion;
    this.branches.set(branchName, [startVersion]);
    
    return {
      name: branchName,
      created: Date.now(),
      baseVersion: startVersion
    };
  }

  // Switch branch
  switchBranch(branchName) {
    if (!this.branches.has(branchName)) {
      throw new Error(`Branch ${branchName} does not exist`);
    }

    this.activeBranch = branchName;
    const branchVersions = this.branches.get(branchName);
    this.currentVersion = branchVersions[branchVersions.length - 1];

    return this.getCurrentVersion();
  }

  // Merge branches
  mergeBranch(sourceBranch, targetBranch = 'main') {
    if (!this.branches.has(sourceBranch)) {
      throw new Error(`Source branch ${sourceBranch} does not exist`);
    }

    const sourceVersions = this.branches.get(sourceBranch);
    const targetVersions = this.branches.get(targetBranch);

    // Find common ancestor
    const commonAncestor = this.findCommonAncestor(sourceVersions, targetVersions);

    // Get latest versions
    const sourceVersion = this.getVersion(sourceVersions[sourceVersions.length - 1]);
    const targetVersion = this.getVersion(targetVersions[targetVersions.length - 1]);

    // Three-way merge
    const mergedContext = this.threeWayMerge(
      this.getVersion(commonAncestor).context,
      sourceVersion.context,
      targetVersion.context
    );

    // Create merge version
    const mergeVersion = this.createVersion(mergedContext, {
      mergeFrom: sourceBranch,
      mergeTo: targetBranch,
      sourceVersion: sourceVersion.id,
      targetVersion: targetVersion.id,
      commonAncestor
    });

    return mergeVersion;
  }

  // Three-way merge algorithm
  threeWayMerge(base, source, target) {
    const merged = this.cloneContext(target);
    const conflicts = [];

    // Calculate deltas
    const sourceDelta = this.calculateDelta(base, source);
    const targetDelta = this.calculateDelta(base, target);

    // Apply non-conflicting changes
    Object.entries(sourceDelta.added).forEach(([path, value]) => {
      if (!targetDelta.added[path] && !targetDelta.modified[path]) {
        this.setValueByPath(merged, path, value);
      } else if (JSON.stringify(targetDelta.added[path]) !== JSON.stringify(value)) {
        conflicts.push({ path, type: 'add-add', source: value, target: targetDelta.added[path] });
      }
    });

    Object.entries(sourceDelta.modified).forEach(([path, change]) => {
      if (!targetDelta.modified[path]) {
        this.setValueByPath(merged, path, change.new);
      } else if (JSON.stringify(change.new) !== JSON.stringify(targetDelta.modified[path].new)) {
        conflicts.push({ 
          path, 
          type: 'modify-modify', 
          source: change.new, 
          target: targetDelta.modified[path].new 
        });
      }
    });

    // Handle conflicts
    if (conflicts.length > 0) {
      merged._conflicts = conflicts;
    }

    return merged;
  }

  // Get version history
  getHistory(branch = null, limit = 50) {
    const versionIds = branch 
      ? this.branches.get(branch) || []
      : this.versionChain;

    return versionIds
      .slice(-limit)
      .reverse()
      .map(id => {
        const version = this.versions.get(id);
        return {
          id: version.id,
          timestamp: version.timestamp,
          metadata: version.metadata,
          checksum: version.checksum,
          deltaSize: version.deltaSize
        };
      });
  }

  // Compare two versions
  compareVersions(versionId1, versionId2) {
    const version1 = this.getVersion(versionId1);
    const version2 = this.getVersion(versionId2);

    return {
      version1: {
        id: version1.id,
        timestamp: version1.timestamp
      },
      version2: {
        id: version2.id,
        timestamp: version2.timestamp
      },
      delta: this.calculateDelta(version1.context, version2.context),
      checksumMatch: version1.checksum === version2.checksum
    };
  }

  // Search versions
  searchVersions(query) {
    const results = [];

    this.versions.forEach((version, id) => {
      // Search in metadata
      const metadataStr = JSON.stringify(version.metadata).toLowerCase();
      if (metadataStr.includes(query.toLowerCase())) {
        results.push({
          id,
          timestamp: version.timestamp,
          metadata: version.metadata,
          relevance: 'metadata'
        });
      }

      // Search in context (if small enough)
      if (version.context && JSON.stringify(version.context).length < 10000) {
        const contextStr = JSON.stringify(version.context).toLowerCase();
        if (contextStr.includes(query.toLowerCase())) {
          results.push({
            id,
            timestamp: version.timestamp,
            metadata: version.metadata,
            relevance: 'context'
          });
        }
      }
    });

    return results;
  }

  // Helper methods
  generateVersionId() {
    return `v${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateChecksum(context) {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(context));
    return hash.digest('hex').substr(0, 8);
  }

  cloneContext(context) {
    return JSON.parse(JSON.stringify(context));
  }

  traverseObject(obj, path, callback) {
    Object.entries(obj || {}).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      callback(currentPath, value);
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.traverseObject(value, currentPath, callback);
      }
    });
  }

  getValueByPath(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  setValueByPath(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  deleteValueByPath(obj, path) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => current?.[key], obj);
    if (target) {
      delete target[lastKey];
    }
  }

  findCommonAncestor(versions1, versions2) {
    const set1 = new Set(versions1);
    for (let i = versions2.length - 1; i >= 0; i--) {
      if (set1.has(versions2[i])) {
        return versions2[i];
      }
    }
    return null;
  }

  reconstructContext(versionId) {
    // Find path from root to this version
    const path = [];
    let current = versionId;
    
    while (current) {
      const version = this.versions.get(current);
      path.unshift(version);
      current = version.metadata.parent;
    }

    // Reconstruct by applying deltas
    let context = path[0].context || {};
    for (let i = 1; i < path.length; i++) {
      if (path[i].delta) {
        context = this.applyDelta(context, path[i].delta);
      } else {
        context = path[i].context;
      }
    }

    return context;
  }

  cleanup() {
    if (this.versionChain.length > this.maxVersions) {
      const toRemove = this.versionChain.length - this.maxVersions;
      const removed = this.versionChain.splice(0, toRemove);
      
      removed.forEach(id => {
        // Don't remove if it's referenced by a branch
        let isReferenced = false;
        this.branches.forEach(branchVersions => {
          if (branchVersions.includes(id)) {
            isReferenced = true;
          }
        });
        
        if (!isReferenced) {
          this.versions.delete(id);
        }
      });
    }
  }

  // Export/Import functionality
  export() {
    return {
      versions: Array.from(this.versions.entries()),
      versionChain: this.versionChain,
      branches: Array.from(this.branches.entries()),
      currentVersion: this.currentVersion,
      activeBranch: this.activeBranch
    };
  }

  import(data) {
    this.versions = new Map(data.versions);
    this.versionChain = data.versionChain;
    this.branches = new Map(data.branches);
    this.currentVersion = data.currentVersion;
    this.activeBranch = data.activeBranch;
  }
}