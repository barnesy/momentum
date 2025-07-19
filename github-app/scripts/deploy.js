#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Deploying Living Context GitHub App...\n');

// Check for required environment variables
const requiredEnvVars = ['GITHUB_APP_ID', 'GITHUB_PRIVATE_KEY', 'WEBHOOK_SECRET'];
const missing = requiredEnvVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  console.error('Please set them in your .env file or environment');
  process.exit(1);
}

// Deployment options
const deployTarget = process.argv[2] || 'cloudflare';

switch (deployTarget) {
  case 'cloudflare':
    deployToCloudflare();
    break;
  case 'vercel':
    deployToVercel();
    break;
  case 'fly':
    deployToFly();
    break;
  default:
    console.error(`Unknown deploy target: ${deployTarget}`);
    console.log('Available targets: cloudflare, vercel, fly');
    process.exit(1);
}

function deployToCloudflare() {
  console.log('📦 Deploying to Cloudflare Workers...\n');
  
  // Create wrangler.toml if it doesn't exist
  const wranglerConfig = `
name = "living-context-github-app"
main = "src/worker.js"
compatibility_date = "2024-01-01"

[vars]
GITHUB_APP_ID = "${process.env.GITHUB_APP_ID}"

[secrets]
GITHUB_PRIVATE_KEY
WEBHOOK_SECRET
`;

  fs.writeFileSync('wrangler.toml', wranglerConfig);
  
  // Create worker wrapper
  const workerCode = `
import { createNodeMiddleware, Webhooks } from '@octokit/webhooks';
import { App } from '@octokit/app';

export default {
  async fetch(request, env) {
    // Handle webhook requests
    if (request.method === 'POST' && request.url.includes('/webhook')) {
      return handleWebhook(request, env);
    }
    
    // Handle WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      return handleWebSocketUpgrade(request, env);
    }
    
    return new Response('Living Context GitHub App', { status: 200 });
  }
};

async function handleWebhook(request, env) {
  // Webhook handling logic
  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256');
  
  // Verify webhook
  // Process event
  // Broadcast to WebSocket clients
  
  return new Response('OK', { status: 200 });
}

async function handleWebSocketUpgrade(request, env) {
  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);
  
  // Handle WebSocket connection
  server.accept();
  
  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}
`;

  fs.writeFileSync('src/worker.js', workerCode);
  
  console.log('🔑 Setting secrets...');
  execSync('wrangler secret put GITHUB_PRIVATE_KEY', { stdio: 'inherit' });
  execSync('wrangler secret put WEBHOOK_SECRET', { stdio: 'inherit' });
  
  console.log('\n🚀 Deploying...');
  execSync('wrangler deploy', { stdio: 'inherit' });
  
  console.log('\n✅ Deployed to Cloudflare Workers!');
  console.log('🔗 Update your GitHub App webhook URL to: https://living-context-github-app.<your-subdomain>.workers.dev/webhook');
}

function deployToVercel() {
  console.log('📦 Deploying to Vercel...\n');
  
  // Create vercel.json
  const vercelConfig = {
    version: 2,
    builds: [
      {
        src: "src/server.js",
        use: "@vercel/node"
      }
    ],
    routes: [
      {
        src: "/webhook",
        dest: "/src/server.js"
      },
      {
        src: "/ws",
        dest: "/src/server.js"
      }
    ],
    env: {
      GITHUB_APP_ID: process.env.GITHUB_APP_ID,
      GITHUB_PRIVATE_KEY: process.env.GITHUB_PRIVATE_KEY,
      WEBHOOK_SECRET: process.env.WEBHOOK_SECRET
    }
  };
  
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  
  console.log('🚀 Deploying...');
  execSync('vercel --prod', { stdio: 'inherit' });
  
  console.log('\n✅ Deployed to Vercel!');
}

function deployToFly() {
  console.log('📦 Deploying to Fly.io...\n');
  
  // Create fly.toml
  const flyConfig = `
app = "living-context-github-app"
primary_region = "iad"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true

[env]
  PORT = "3000"
  NODE_ENV = "production"

[[services]]
  protocol = "tcp"
  internal_port = 8080
  
  [[services.ports]]
    port = 8080
    handlers = ["http", "tls"]

[deploy]
  release_command = "npm run migrate"
`;

  fs.writeFileSync('fly.toml', flyConfig);
  
  // Create Dockerfile
  const dockerfile = `
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000 8080

CMD ["node", "src/server.js"]
`;

  fs.writeFileSync('Dockerfile', dockerfile);
  
  console.log('🚀 Deploying...');
  execSync('fly deploy', { stdio: 'inherit' });
  
  console.log('\n✅ Deployed to Fly.io!');
  console.log('🔗 Update your GitHub App webhook URL to: https://living-context-github-app.fly.dev/webhook');
}

console.log('\n🎉 Deployment complete!');
console.log('\nNext steps:');
console.log('1. Update your GitHub App webhook URL');
console.log('2. Install the app on your repositories');
console.log('3. Open the browser extension to see real-time context updates');