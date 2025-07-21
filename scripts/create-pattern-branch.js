#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Get branch name from command line
const branchName = process.argv[2];

if (!branchName) {
  console.error('❌ Please provide a branch name');
  console.log('Usage: npm run create:pattern-branch "feature/my-components"');
  process.exit(1);
}

console.log('🚀 Creating pattern review branch...\n');

try {
  // Check for pending components
  const pendingDir = join(projectRoot, 'src/experiment/components/pending');
  if (!existsSync(pendingDir)) {
    console.log('❌ No pending directory found');
    process.exit(1);
  }

  const pendingComponents = readdirSync(pendingDir).filter(f => f !== '.gitkeep');
  
  if (pendingComponents.length === 0) {
    console.log('❌ No pending components found');
    console.log('💡 Generate some components first using the Component Generator');
    process.exit(1);
  }

  console.log(`📦 Found ${pendingComponents.length} pending components:`);
  pendingComponents.forEach(comp => console.log(`   - ${comp}`));
  console.log('');

  // Create and checkout new branch
  console.log(`🌿 Creating branch: ${branchName}`);
  execSync(`git checkout -b ${branchName}`, { cwd: projectRoot });
  
  // Stage pending components
  console.log('📝 Staging pending components...');
  execSync('git add src/experiment/components/pending/', { cwd: projectRoot });
  
  // Create initial commit
  const componentList = pendingComponents.join(', ');
  const commitMessage = `feat: Add pending components for review

Components:
${pendingComponents.map(c => `- ${c}`).join('\n')}

These components are pending review. Please evaluate:
- Code quality and best practices
- Accessibility compliance
- Performance considerations
- Reusability potential

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>`;
  
  execSync(`git commit -m "${commitMessage}"`, { cwd: projectRoot });
  
  console.log('\n✅ Pattern branch created successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Review and refine components as needed');
  console.log('2. Run: npm run submit:patterns');
  console.log('3. Create PR for team review');
  
} catch (error) {
  console.error('❌ Error creating pattern branch:', error.message);
  process.exit(1);
}