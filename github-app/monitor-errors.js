import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ERROR_LOG_FILE = path.join(__dirname, '..', 'browser-errors.log');

console.log('Monitoring browser errors...');
console.log('Reload the Chrome extension to test error detection\n');

let lastSize = 0;

// Check for new errors every second
setInterval(() => {
  try {
    const stats = fs.statSync(ERROR_LOG_FILE);
    if (stats.size > lastSize) {
      // Read new content
      const content = fs.readFileSync(ERROR_LOG_FILE, 'utf8');
      const lines = content.trim().split('\n');
      const newLines = lines.slice(-1); // Get last line
      
      for (const line of newLines) {
        if (line) {
          try {
            const error = JSON.parse(line);
            console.log('\n🚨 BROWSER ERROR DETECTED:');
            console.log(`Message: ${error.message}`);
            console.log(`Source: ${error.source}`);
            console.log(`URL: ${error.url}`);
            console.log(`Time: ${error.timestamp}`);
            
            if (error.stack) {
              console.log('\nStack trace:');
              console.log(error.stack);
            }
            
            console.log('\n---\n');
          } catch (e) {
            // Skip malformed lines
          }
        }
      }
      
      lastSize = stats.size;
    }
  } catch (e) {
    // File doesn't exist yet
  }
}, 1000);

// Keep the process running
process.on('SIGINT', () => {
  console.log('\nStopping error monitor...');
  process.exit(0);
});