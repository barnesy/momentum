#!/usr/bin/env node

import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Get commit message from command line or prompt
const commitMessageArg = process.argv.slice(2).join(' ');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  try {
    // Check for changes
    const status = execSync('git status --porcelain', { cwd: projectRoot }).toString();
    
    if (!status.trim()) {
      console.log('✅ No changes to commit');
      process.exit(0);
    }
    
    console.log('📝 Changed files:');
    console.log(status);
    
    // Get commit message
    let commitMessage = commitMessageArg;
    
    if (!commitMessage) {
      console.log('\n💬 Enter commit message:');
      commitMessage = await question('> ');
    }
    
    if (!commitMessage.trim()) {
      console.log('❌ Commit message is required');
      process.exit(1);
    }
    
    // Stage all pattern-related changes
    console.log('\n📦 Staging changes...');
    execSync('git add src/experiment/components/', { cwd: projectRoot });
    execSync('git add src/experiment/patterns/', { cwd: projectRoot });
    
    // Create commit with formatted message
    const fullMessage = `${commitMessage}

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>`;
    
    execSync(`git commit -m "${fullMessage}"`, { cwd: projectRoot });
    
    console.log('\n✅ Patterns committed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Push your branch: git push origin HEAD');
    console.log('2. Create a pull request');
    console.log('3. Or run: npm run submit:patterns');
    
  } catch (error) {
    console.error('❌ Error committing patterns:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();