# 🚀 Momentum Experimentation Lab

Welcome to the Momentum Experimentation Lab! This is your playground for generating, testing, and reviewing UI components and patterns.

## 🎯 Quick Start

### 1. Start the Development Server

```bash
# From the project root
npm run dev:experiment

# Or manually
npm run dev
# Then navigate to http://localhost:5173/src/experiment/
```

### 2. Access Key Features

Once the server is running, you'll be redirected to the DBML Editor by default. Use the sidebar to navigate to:

- **🎨 Component Generator** - AI-powered component creation
- **📚 Pattern Catalog** - Browse and use existing patterns
- **🗄️ DBML Schema Editor** - Design and visualize database schemas
- **🎯 Theme Editor** - Customize the look and feel

## 🎨 Pattern Generation Workflow

### Step 1: Generate Components

1. Navigate to **Component Generator** in the sidebar
2. Describe what you want to build (e.g., "Create a dashboard card for displaying user statistics")
3. The AI will generate multiple variations
4. Components appear in the review queue with live preview

### Step 2: Review & Iterate

1. **Review Queue** shows all generated components
2. Use 👍 to approve or 👎 to reject components
3. Add feedback for improvements
4. Iterate until satisfied

### Step 3: Organize Components

Components are automatically organized into folders:
- `📁 pending/` - Components awaiting review
- `✅ approved/` - Ready for production
- `❌ rejected/` - Archived with feedback

### Step 4: Create a Review Branch

```bash
# Create a new branch for your patterns
npm run create:pattern-branch "feature/dashboard-components"

# This will:
# 1. Create a new branch
# 2. Move pending components to the branch
# 3. Generate a PR template
```

### Step 5: Submit for Review

```bash
# Commit your patterns
npm run commit:patterns "Add dashboard component patterns"

# Push and create PR
npm run submit:patterns
```

## 📋 Component Generator Commands

While in the Component Generator, you can use these quick commands:

- **"Show variations"** → Generate 3-5 different approaches
- **"Make it compact"** → Create condensed version
- **"Add [feature]"** → Enhance with specific feature
- **"Production ready"** → Add loading, error, empty states
- **"Real data"** → Use realistic sample data

## 🗂️ Project Structure

```
src/experiment/
├── components/
│   ├── pending/        # Components awaiting review
│   ├── approved/       # Production-ready components
│   ├── rejected/       # Archived components
│   └── Features/       # Core features (Generator, Editor, etc.)
├── routes/            # Routing configuration
├── patterns/          # Reusable patterns library
└── README.md         # This file
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev:experiment    # Start the experiment lab
npm run test:components   # Test generated components

# Pattern Management
npm run create:pattern-branch   # Create review branch
npm run commit:patterns        # Commit with template
npm run submit:patterns        # Create PR

# Utilities
npm run clean:pending     # Clean pending folder
npm run export:approved   # Export approved components
```

## 💡 Tips for Effective Pattern Generation

1. **Be Specific**: Describe exactly what you need
   - ❌ "Create a card"
   - ✅ "Create a metric card showing revenue with trend indicator and sparkline"

2. **Iterate Quickly**: Generate multiple variations and pick the best
3. **Think Components**: Break complex UIs into smaller, reusable pieces
4. **Use Real Data**: Components with realistic data are easier to evaluate
5. **Document Intent**: Add comments about why you approved/rejected

## 🔧 Configuration

### Theme Customization
Use the Theme Editor to adjust:
- Colors, typography, spacing
- Light/dark mode
- Component density

### DBML Schemas
The DBML Editor includes example schemas:
- `momentum` - Main application schema
- `auth` - Authentication schema
- `analytics` - Metrics tracking

## 🤝 Contributing

1. Always work in feature branches
2. Use the pattern review workflow
3. Include screenshots in PRs
4. Document component props and usage

## 🐛 Troubleshooting

### Server won't start?
```bash
# Kill any existing processes
pkill -f vite
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Components not rendering?
1. Check browser console for errors
2. Ensure you're on the correct URL path
3. Try hard refresh (Cmd+Shift+R)

### Can't see generated components?
- Check the pending folder: `src/experiment/components/pending/`
- Refresh the Component Generator page
- Check console for import errors

## 📚 Learn More

- [Material-UI Documentation](https://mui.com/)
- [React Best Practices](https://react.dev/learn)
- [DBML Language Guide](https://www.dbml.org/docs/)

---

Happy pattern generating! 🎨✨