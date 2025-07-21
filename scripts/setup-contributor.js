#!/usr/bin/env node

import { execSync } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('🚀 Momentum Contributor Setup\n');
  
  try {
    // Check current remotes
    const remotes = execSync('git remote -v', { cwd: projectRoot }).toString();
    console.log('Current remotes:');
    console.log(remotes);
    
    // Ask about workflow preference
    console.log('\n📋 Which workflow will you use?');
    console.log('1. Direct push (core team with write access)');
    console.log('2. Fork-based (external contributors)');
    const choice = await question('\nEnter choice (1 or 2): ');
    
    if (choice === '2') {
      console.log('\n🍴 Fork-based workflow selected\n');
      
      // Check if upstream exists
      if (!remotes.includes('upstream')) {
        console.log('Adding upstream remote...');
        execSync('git remote add upstream https://github.com/barnesy/momentum.git', { cwd: projectRoot });
        console.log('✅ Upstream remote added');
      } else {
        console.log('✅ Upstream remote already exists');
      }
      
      // Provide instructions
      console.log('\n📝 Fork-based workflow setup:');
      console.log('1. Fork the repository on GitHub');
      console.log('2. Update your origin remote:');
      console.log('   git remote set-url origin git@github.com:YOUR_USERNAME/momentum.git');
      console.log('3. Fetch from upstream:');
      console.log('   git fetch upstream');
      console.log('4. Create feature branches from upstream/main:');
      console.log('   git checkout -b feature/your-feature upstream/main');
      console.log('5. Push to your fork:');
      console.log('   git push origin feature/your-feature');
      console.log('6. Create PR from your fork to barnesy/momentum\n');
      
    } else {
      console.log('\n👥 Direct push workflow selected\n');
      
      // Test push access
      console.log('Testing repository access...');
      const username = await question('Enter your GitHub username: ');
      
      console.log('\n📝 Direct push workflow:');
      console.log('1. Ensure you have write access (check with repo owner)');
      console.log('2. Use SSH for authentication:');
      console.log('   git remote set-url origin git@github.com:barnesy/momentum.git');
      console.log('3. Or use Personal Access Token:');
      console.log('   git remote set-url origin https://TOKEN@github.com/barnesy/momentum.git');
      console.log('4. Create feature branches:');
      console.log('   git checkout -b feature/your-feature');
      console.log('5. Push directly:');
      console.log('   git push origin feature/your-feature\n');
    }
    
    // Check SSH key
    console.log('🔑 Checking SSH authentication...');
    try {
      execSync('ssh -T git@github.com', { stdio: 'ignore' });
      console.log('✅ SSH authentication is set up');
    } catch (e) {
      console.log('❌ SSH key not found or not configured');
      console.log('💡 Set up SSH: https://docs.github.com/en/authentication/connecting-to-github-with-ssh');
    }
    
    // Install dependencies
    const installDeps = await question('\nInstall dependencies? (y/n): ');
    if (installDeps.toLowerCase() === 'y') {
      console.log('\n📦 Installing dependencies...');
      execSync('npm install', { cwd: projectRoot, stdio: 'inherit' });
    }
    
    console.log('\n✅ Setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run dev:experiment');
    console.log('2. Create your feature branch');
    console.log('3. Make your changes');
    console.log('4. Submit PR following CONTRIBUTING.md guidelines');
    console.log('\nHappy coding! 🎉');
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    rl.close();
  }
}

main();