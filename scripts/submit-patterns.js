#!/usr/bin/env node

import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🚀 Submitting patterns for review...\n');

try {
  // Get current branch
  const currentBranch = execSync('git branch --show-current', { cwd: projectRoot })
    .toString()
    .trim();
    
  if (currentBranch === 'main') {
    console.log('❌ Cannot submit patterns from main branch');
    console.log('💡 First create a pattern branch: npm run create:pattern-branch "feature/my-patterns"');
    process.exit(1);
  }
  
  console.log(`📍 Current branch: ${currentBranch}`);
  
  // Check for uncommitted changes
  const status = execSync('git status --porcelain', { cwd: projectRoot }).toString();
  
  if (status.trim()) {
    console.log('\n⚠️  You have uncommitted changes:');
    console.log(status);
    console.log('\n💡 Commit them first: npm run commit:patterns "Your message"');
    process.exit(1);
  }
  
  // Push branch
  console.log('\n📤 Pushing branch to remote...');
  execSync(`git push -u origin ${currentBranch}`, { cwd: projectRoot });
  
  // Create PR using GitHub CLI if available
  try {
    execSync('gh --version', { stdio: 'ignore' });
    
    console.log('\n📝 Creating pull request...');
    
    const prTitle = `Pattern Review: ${currentBranch.replace(/^feature\//, '')}`;
    const prBody = `## 🎨 Pattern Review Request

### Components Added
Please review the new components in \`src/experiment/components/pending/\`

### Review Checklist
- [ ] Code follows project conventions
- [ ] Components are accessible (ARIA labels, keyboard nav)
- [ ] Props are well-documented
- [ ] Error states are handled
- [ ] Loading states are implemented
- [ ] Components are responsive
- [ ] No console errors or warnings

### Testing
- [ ] Components render correctly
- [ ] Interactive elements work as expected
- [ ] Edge cases are handled

### Next Steps
After approval, components will be moved to \`approved/\` folder.

---
🤖 Generated with Claude Code`;
    
    const prCommand = `gh pr create --title "${prTitle}" --body "${prBody}" --base main`;
    execSync(prCommand, { cwd: projectRoot, stdio: 'inherit' });
    
    console.log('\n✅ Pull request created successfully!');
    
  } catch (ghError) {
    console.log('\n💡 GitHub CLI not found. Create PR manually:');
    console.log(`   https://github.com/barnesy/momentum/compare/${currentBranch}?expand=1`);
  }
  
  console.log('\n🎉 Patterns submitted for review!');
  
} catch (error) {
  console.error('❌ Error submitting patterns:', error.message);
  process.exit(1);
}