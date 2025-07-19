# Setting Up Public Webhook URL for Momentum

GitHub needs a public URL to send webhooks to. Here are your options:

## Option 1: ngrok (Recommended for Testing)

1. **Install ngrok**:
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your Momentum server**:
   ```bash
   cd github-app
   npm run dev
   ```

3. **In another terminal, create tunnel**:
   ```bash
   ngrok http 3000
   ```

4. **You'll see output like**:
   ```
   Forwarding https://abc123.ngrok.io -> http://localhost:3000
   ```

5. **Use this URL for GitHub App**:
   ```
   Webhook URL: https://abc123.ngrok.io/webhook
   ```

## Option 2: Cloudflare Tunnel (Free)

1. **Install Cloudflare CLI**:
   ```bash
   brew install cloudflare/cloudflare/cloudflared
   ```

2. **Create tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

3. **Use the provided URL + /webhook**

## Option 3: Deploy First (Production Ready)

### Deploy to Vercel (Easiest)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd github-app
   vercel
   ```

3. **Use Vercel URL**:
   ```
   Webhook URL: https://your-app.vercel.app/webhook
   ```

### Deploy to Cloudflare Workers

1. **Install Wrangler**:
   ```bash
   npm i -g wrangler
   ```

2. **Deploy**:
   ```bash
   cd github-app
   npm run deploy cloudflare
   ```

3. **Use Workers URL**:
   ```
   Webhook URL: https://momentum.your-subdomain.workers.dev/webhook
   ```

## Quick Solution Right Now:

Since you're creating the GitHub App now, here's the fastest approach:

1. **Use a placeholder URL**:
   ```
   https://momentum-webhook.vercel.app/webhook
   ```

2. **Create the GitHub App**

3. **Then update the webhook URL** after you set up ngrok or deploy

You can always change the webhook URL later in your GitHub App settings!

## For Immediate Testing:

```bash
# Terminal 1
cd github-app
npm run dev

# Terminal 2
npx ngrok http 3000

# Copy the HTTPS URL from ngrok output
# Update GitHub App webhook URL to: https://YOUR-NGROK-ID.ngrok.io/webhook
```