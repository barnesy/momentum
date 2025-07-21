#!/bin/bash

# Setup script for OpenAI API integration

echo "==================================="
echo "OpenAI Codex Integration Setup"
echo "==================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please run setup-env.sh first."
    exit 1
fi

# Check if API key is already set
if grep -q "OPENAI_API_KEY=your-openai-api-key-here" .env; then
    echo "OpenAI API key is not configured."
    echo ""
    echo "To get your OpenAI API key:"
    echo "1. Go to https://platform.openai.com/api-keys"
    echo "2. Sign in or create an account"
    echo "3. Click 'Create new secret key'"
    echo "4. Copy the key (you won't be able to see it again!)"
    echo ""
    read -p "Enter your OpenAI API key: " api_key
    
    if [ -z "$api_key" ]; then
        echo "Error: No API key provided"
        exit 1
    fi
    
    # Update the .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/OPENAI_API_KEY=your-openai-api-key-here/OPENAI_API_KEY=$api_key/" .env
    else
        # Linux
        sed -i "s/OPENAI_API_KEY=your-openai-api-key-here/OPENAI_API_KEY=$api_key/" .env
    fi
    
    echo "✅ OpenAI API key configured successfully!"
else
    echo "✅ OpenAI API key is already configured"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Setup complete! 🎉"
echo ""
echo "Available Codex features:"
echo "- Code suggestions (Ctrl/Cmd + K)"
echo "- Code explanation (Ctrl/Cmd + Shift + E)"
echo "- Code analysis"
echo "- Test generation"
echo "- Code refactoring"
echo "- Pattern detection"
echo ""
echo "To test the integration:"
echo "1. Start the server: npm run dev"
echo "2. Reload the browser extension"
echo "3. Go to GitHub and select some code"
echo "4. Press Ctrl/Cmd + K for suggestions"