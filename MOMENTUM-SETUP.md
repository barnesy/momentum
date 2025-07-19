# Setting Up Momentum

**Momentum** - Building development velocity through intelligent context

Follow these steps to get your Momentum system running!

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `momentum`
3. Description: "Building development velocity through intelligent GitHub context"
4. Make it public (recommended for GitHub App)
5. Click "Create repository"

## Step 2: Clone and Initialize

```bash
# Clone your new repository
git clone https://github.com/YOUR_USERNAME/momentum.git
cd momentum

# Copy Momentum files
cp -r /Users/barnesy/Projects/browser-dev-integration/* .

# Initial commit
git add .
git commit -m "Initial Momentum setup ⚡"
git push origin main
```

## Step 3: Create GitHub App

1. Go to https://github.com/settings/apps/new
2. Use these settings:

**GitHub App name**: Momentum Dev (or Momentum + your username)

**Homepage URL**: https://github.com/YOUR_USERNAME/momentum

**Webhook URL**: http://localhost:3000/webhook (we'll update this after deployment)

**Webhook secret**: Generate one with: `openssl rand -base64 32`

**Permissions & Events**: Copy from `/github-app/manifest.json`

3. Click "Create GitHub App"

4. After creation:
   - Note your **App ID**
   - Generate a **Private Key** (downloads .pem file)
   - Save your **Webhook Secret**

## Step 4: Configure Local Environment

```bash
cd github-app
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` with your credentials:
```env
GITHUB_APP_ID=your_app_id_here
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
your_private_key_contents_here
-----END RSA PRIVATE KEY-----"
WEBHOOK_SECRET=your_webhook_secret_here
```

## Step 5: Test Locally

```bash
# Terminal 1: Start Momentum server
npm run dev

# Terminal 2: Expose local server (using ngrok or similar)
ngrok http 3000
```

Update your GitHub App's webhook URL to the ngrok URL + `/webhook`

## Step 6: Install App on Repository

1. Go to https://github.com/apps/YOUR_APP_NAME
2. Click "Install"
3. Select your `momentum` repository
4. Click "Install"

## Step 7: Deploy to Production

For Cloudflare Workers (recommended):
```bash
npm run deploy cloudflare
```

For other platforms:
```bash
npm run deploy vercel
# or
npm run deploy fly
```

Update your GitHub App's webhook URL to your production URL.

## Step 8: Install Browser Extension (Momentum Vision)

1. Open Chrome
2. Go to chrome://extensions/
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `extension-v2` folder
6. The Momentum icon should appear in your toolbar

## Step 9: Test Your Momentum

1. Make a commit to your repository
2. Watch the Momentum overlay update in real-time
3. Open a PR and see velocity metrics
4. Check `.github/CONTEXT/` for your momentum data

## Troubleshooting

**WebSocket not connecting?**
- Check the WebSocket URL in `extension-v2/background.js`
- Update it to your production URL

**Webhooks not receiving?**
- Check GitHub App settings for webhook delivery status
- Verify webhook secret matches

**No momentum updates?**
- Ensure GitHub Actions are enabled in your repository
- Check Actions tab for any failures

## Success Checklist

- [ ] GitHub repository created as `momentum`
- [ ] Momentum GitHub App created and installed
- [ ] Local testing successful
- [ ] Deployed to production
- [ ] Browser extension showing real-time velocity
- [ ] Momentum data appearing in `.github/CONTEXT/`

## Your Momentum Dashboard

Once running, Momentum tracks:
- **Velocity**: Commits/hour, PRs/day
- **Flow State**: Peak productivity times
- **Patterns**: What accelerates or slows development
- **Context**: Never lose track of what you were doing

Welcome to development with Momentum! ⚡🚀