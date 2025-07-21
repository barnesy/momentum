#!/bin/bash

echo "🚀 Momentum GitHub App Setup"
echo "=========================="
echo ""
echo "Please have ready:"
echo "1. Your GitHub App ID"
echo "2. Your .pem private key file"
echo "3. Your webhook secret (or we'll generate one)"
echo ""

# Get App ID
read -p "Enter your GitHub App ID: " APP_ID

# Get Private Key
echo ""
echo "Drag and drop your .pem file here (or paste the path):"
read PEM_PATH

# Read private key
if [ -f "$PEM_PATH" ]; then
    PRIVATE_KEY=$(cat "$PEM_PATH")
    echo "✅ Private key loaded"
else
    echo "❌ Could not find private key file at: $PEM_PATH"
    exit 1
fi

# Get or generate webhook secret
echo ""
echo "Enter your webhook secret (or press Enter to generate one):"
read WEBHOOK_SECRET

if [ -z "$WEBHOOK_SECRET" ]; then
    WEBHOOK_SECRET=$(openssl rand -base64 32)
    echo "Generated webhook secret: $WEBHOOK_SECRET"
    echo "⚠️  Remember to update this in your GitHub App settings!"
fi

# Write .env file
cat > .env << EOF
# GitHub App Configuration
GITHUB_APP_ID=$APP_ID
GITHUB_PRIVATE_KEY="$PRIVATE_KEY"
WEBHOOK_SECRET=$WEBHOOK_SECRET

# Server Configuration
PORT=3000
NODE_ENV=development
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "Next steps:"
echo "1. If you generated a new webhook secret, update it in GitHub App settings"
echo "2. Run: npm run dev"
echo "3. Your Momentum server will be running at http://localhost:3000"