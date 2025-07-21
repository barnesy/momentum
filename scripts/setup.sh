#!/bin/bash

# Momentum Setup Script
# This script automates the initial setup of Momentum

set -e

echo "🚀 Momentum Setup Script"
echo "========================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisite() {
    local cmd=$1
    local name=$2
    local min_version=$3
    
    if command -v $cmd &> /dev/null; then
        if [ -n "$min_version" ]; then
            version=$($cmd --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
            echo -e "${GREEN}✓${NC} $name found (version $version)"
        else
            echo -e "${GREEN}✓${NC} $name found"
        fi
    else
        echo -e "${RED}✗${NC} $name not found"
        return 1
    fi
}

echo "Checking prerequisites..."
echo "------------------------"

prerequisites_ok=true

if ! check_prerequisite "node" "Node.js" "18.0"; then
    prerequisites_ok=false
    echo "  Please install Node.js 18 or higher: https://nodejs.org"
fi

if ! check_prerequisite "npm" "npm" "8.0"; then
    prerequisites_ok=false
    echo "  npm should come with Node.js installation"
fi

if ! check_prerequisite "git" "Git"; then
    prerequisites_ok=false
    echo "  Please install Git: https://git-scm.com"
fi

echo ""

if [ "$prerequisites_ok" = false ]; then
    echo -e "${RED}Prerequisites check failed. Please install missing dependencies.${NC}"
    exit 1
fi

echo -e "${GREEN}All prerequisites met!${NC}"
echo ""

# Setup function
setup_momentum() {
    echo "Setting up Momentum..."
    echo "--------------------"
    
    # Install server dependencies
    echo -e "\n${YELLOW}Installing server dependencies...${NC}"
    cd github-app
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        echo -e "\n${YELLOW}Creating .env file...${NC}"
        cat > .env << EOF
# GitHub App Configuration
GITHUB_APP_ID=your_app_id_here
GITHUB_PRIVATE_KEY=path/to/private-key.pem
WEBHOOK_SECRET=your_webhook_secret_here

# Server Configuration
PORT=3000

# Optional: AI Service Configuration
# OPENAI_API_KEY=your_openai_api_key
# ANTHROPIC_API_KEY=your_anthropic_api_key
EOF
        echo -e "${GREEN}✓${NC} Created .env file"
        echo -e "${YELLOW}  Please update the .env file with your GitHub App credentials${NC}"
    else
        echo -e "${GREEN}✓${NC} .env file already exists"
    fi
    
    # Create necessary directories
    echo -e "\n${YELLOW}Creating directories...${NC}"
    mkdir -p logs
    mkdir -p .github/CONTEXT
    echo -e "${GREEN}✓${NC} Directories created"
    
    cd ..
}

# Extension setup helper
setup_extension() {
    echo -e "\n${YELLOW}Browser Extension Setup${NC}"
    echo "----------------------"
    echo "1. Open Chrome and navigate to: chrome://extensions/"
    echo "2. Enable 'Developer mode' in the top right"
    echo "3. Click 'Load unpacked' and select the 'extension-v2' folder"
    echo ""
    echo "Extension folder path: $(pwd)/extension-v2"
}

# GitHub App setup helper
setup_github_app() {
    echo -e "\n${YELLOW}GitHub App Setup Instructions${NC}"
    echo "-----------------------------"
    echo "1. Go to: https://github.com/settings/apps/new"
    echo "2. Use these settings:"
    echo "   - Name: Momentum-$(whoami)"
    echo "   - Homepage URL: http://localhost:3000"
    echo "   - Webhook URL: (use ngrok or similar for local development)"
    echo "   - Webhook secret: $(openssl rand -hex 32)"
    echo ""
    echo "3. Set these permissions:"
    echo "   - Actions: Read"
    echo "   - Checks: Write"
    echo "   - Contents: Write"
    echo "   - Issues: Write"
    echo "   - Metadata: Read"
    echo "   - Pull requests: Write"
    echo ""
    echo "4. Subscribe to these events:"
    echo "   - Check run"
    echo "   - Issue comment"
    echo "   - Issues"
    echo "   - Pull request"
    echo "   - Pull request review"
    echo "   - Push"
    echo "   - Repository"
    echo ""
    echo "5. After creating, download the private key and save it in the github-app directory"
}

# Start server
start_server() {
    echo -e "\n${YELLOW}Starting Momentum server...${NC}"
    echo "-------------------------"
    cd github-app
    
    # Check if .env is configured
    if grep -q "your_app_id_here" .env; then
        echo -e "${RED}Warning: .env file not configured yet${NC}"
        echo "Please update the .env file with your GitHub App credentials first"
        return
    fi
    
    echo "Starting server with npm run dev..."
    echo "Press Ctrl+C to stop the server"
    npm run dev
}

# Main menu
show_menu() {
    echo -e "\n${YELLOW}What would you like to do?${NC}"
    echo "1) Run complete setup"
    echo "2) Install dependencies only"
    echo "3) Show extension setup instructions"
    echo "4) Show GitHub App setup instructions"
    echo "5) Start server"
    echo "6) Open setup wizard in browser"
    echo "7) Exit"
    echo ""
    read -p "Enter your choice (1-7): " choice
    
    case $choice in
        1)
            setup_momentum
            setup_extension
            setup_github_app
            ;;
        2)
            setup_momentum
            ;;
        3)
            setup_extension
            ;;
        4)
            setup_github_app
            ;;
        5)
            start_server
            ;;
        6)
            echo "Opening setup wizard..."
            if command -v open &> /dev/null; then
                open "file://$(pwd)/setup-wizard.html"
            elif command -v xdg-open &> /dev/null; then
                xdg-open "file://$(pwd)/setup-wizard.html"
            else
                echo "Please open setup-wizard.html in your browser"
            fi
            ;;
        7)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            ;;
    esac
}

# Main execution
echo "Welcome to Momentum - Development Acceleration System"
echo ""

# Check if we're in the right directory
if [ ! -d "github-app" ] || [ ! -d "extension-v2" ]; then
    echo -e "${RED}Error: This script must be run from the Momentum root directory${NC}"
    echo "Please cd to the Momentum directory and run: ./setup.sh"
    exit 1
fi

# Show menu in a loop
while true; do
    show_menu
done