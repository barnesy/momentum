# 🤝 Contributing to Momentum

Thank you for your interest in contributing to Momentum! This guide will help you get started.

## 🚀 Quick Start

### For Core Team Members (with Write Access)

```bash
# Clone the repository
git clone git@github.com:barnesy/momentum.git
cd momentum

# Install dependencies
npm install

# Start the experiment lab
npm run dev:experiment

# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: Your feature description"

# Push to repository
git push origin feature/your-feature-name

# Create PR on GitHub
```

### For External Contributors (Fork-Based)

```bash
# 1. Fork the repository on GitHub (click Fork button)

# 2. Clone your fork
git clone git@github.com:YOUR_USERNAME/momentum.git
cd momentum

# 3. Add upstream remote
git remote add upstream git@github.com:barnesy/momentum.git

# 4. Install dependencies
npm install

# 5. Create feature branch
git checkout -b feature/your-feature-name

# 6. Make changes and commit
git add .
git commit -m "feat: Your feature description"

# 7. Push to your fork
git push origin feature/your-feature-name

# 8. Create PR from your fork to barnesy/momentum:main
```

## 🎨 Pattern Generation Workflow

When creating new UI patterns:

1. **Start the Experiment Lab**
   ```bash
   npm run dev:experiment
   ```

2. **Generate Components**
   - Navigate to Component Generator
   - Describe what you need
   - Review generated variations

3. **Create Pattern Branch**
   ```bash
   npm run create:pattern-branch "feature/component-name"
   ```

4. **Submit for Review**
   ```bash
   npm run submit:patterns
   ```

## 📝 Commit Message Guidelines

We follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

Examples:
```bash
git commit -m "feat: Add user profile card component"
git commit -m "fix: Resolve navigation routing issue"
git commit -m "docs: Update component generation guide"
```

## 🔄 Keeping Your Fork Updated

If using fork-based workflow:

```bash
# Fetch upstream changes
git fetch upstream

# Switch to main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push to your fork
git push origin main

# Create new feature branch from updated main
git checkout -b feature/new-feature
```

## 📋 Pull Request Process

1. **Before Creating PR**
   - Run tests: `npm test`
   - Check linting: `npm run lint`
   - Test your changes thoroughly

2. **PR Title**
   - Use conventional commit format
   - Be descriptive but concise

3. **PR Description**
   - Describe what changes you made
   - Include screenshots for UI changes
   - Reference any related issues

4. **PR Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Component renders correctly
   - [ ] No console errors
   - [ ] Responsive design works
   - [ ] Accessibility checked

   ## Screenshots
   (if applicable)
   ```

## 🐛 Reporting Issues

1. **Check Existing Issues**
   - Search to see if already reported
   - Add to existing issue if relevant

2. **Create New Issue**
   - Use clear, descriptive title
   - Include steps to reproduce
   - Add error messages/screenshots
   - Specify environment details

## 💡 Feature Requests

1. **Open a Discussion**
   - Explain the feature
   - Provide use cases
   - Include mockups if possible

2. **Wait for Feedback**
   - Discuss with maintainers
   - Refine based on feedback
   - Get approval before implementing

## 🏗️ Project Structure

```
momentum/
├── src/
│   ├── experiment/        # Experimentation lab
│   │   ├── components/    # UI components
│   │   │   ├── pending/   # Under review
│   │   │   ├── approved/  # Ready to use
│   │   │   └── rejected/  # Archived
│   │   ├── routes/        # Routing config
│   │   └── patterns/      # Pattern library
│   └── theme/             # Theme configuration
├── scripts/               # Helper scripts
├── docs/                  # Documentation
└── tests/                 # Test files
```

## 🛠️ Development Guidelines

### Code Style
- Use TypeScript when possible
- Follow existing patterns
- Keep components small and focused
- Write self-documenting code

### Component Guidelines
- Use Material-UI components
- Make components responsive
- Include proper TypeScript types
- Add JSDoc comments for props

### Testing
- Test user interactions
- Check edge cases
- Verify accessibility
- Test responsiveness

## 🚨 Need Help?

- **Documentation**: Check `/docs` folder
- **Quick Start**: See `QUICKSTART.md`
- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions

## 🙏 Thank You!

Your contributions make Momentum better for everyone. We appreciate your time and effort!

---

**Note**: If you're having permission issues, see [REPOSITORY_PERMISSIONS.md](docs/REPOSITORY_PERMISSIONS.md)