#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('📦 Exporting approved components...\n');

try {
  const approvedDir = join(projectRoot, 'src/experiment/components/approved');
  const exportDir = join(projectRoot, 'dist/components');
  
  if (!existsSync(approvedDir)) {
    console.log('❌ No approved components directory found');
    process.exit(1);
  }
  
  // Get all approved components
  const components = readdirSync(approvedDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  
  if (components.length === 0) {
    console.log('❌ No approved components found');
    process.exit(1);
  }
  
  // Create export directory
  if (!existsSync(exportDir)) {
    mkdirSync(exportDir, { recursive: true });
  }
  
  console.log(`Found ${components.length} approved components:`);
  
  // Create index file
  let indexContent = '// Auto-generated component exports\n\n';
  
  components.forEach(file => {
    const componentName = file.replace(/\.(tsx?|jsx?)$/, '');
    console.log(`   ✅ ${componentName}`);
    
    // Copy component file
    const content = readFileSync(join(approvedDir, file), 'utf8');
    writeFileSync(join(exportDir, file), content);
    
    // Add to index
    indexContent += `export * from './${componentName}';\n`;
  });
  
  // Write index file
  writeFileSync(join(exportDir, 'index.ts'), indexContent);
  
  // Create package.json for the component library
  const packageJson = {
    name: '@momentum/components',
    version: '1.0.0',
    main: 'index.ts',
    types: 'index.ts',
    dependencies: {
      '@mui/material': '^6.3.0',
      '@emotion/react': '^11.14.0',
      '@emotion/styled': '^11.14.1',
      'react': '^18.2.0'
    }
  };
  
  writeFileSync(
    join(exportDir, 'package.json'), 
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create README
  const readme = `# Momentum Components

## Installation

\`\`\`bash
npm install @momentum/components
\`\`\`

## Usage

\`\`\`tsx
import { ComponentName } from '@momentum/components';

function App() {
  return <ComponentName />;
}
\`\`\`

## Available Components

${components.map(c => `- ${c.replace(/\.(tsx?|jsx?)$/, '')}`).join('\n')}
`;
  
  writeFileSync(join(exportDir, 'README.md'), readme);
  
  console.log(`\n✅ Exported ${components.length} components to ${exportDir}`);
  console.log('\n📋 Next steps:');
  console.log('1. Review exported components in dist/components/');
  console.log('2. Publish to npm or use locally');
  console.log('3. Import in other projects');
  
} catch (error) {
  console.error('❌ Error exporting components:', error.message);
  process.exit(1);
}