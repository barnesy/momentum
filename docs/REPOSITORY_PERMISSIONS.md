# 🔐 Repository Permissions Guide

This guide helps resolve the issue where collaborators cannot push branches to the repository.

## 🚨 The Issue

Collaborators are getting this error:
```
ERROR: Permission to barnesy/momentum.git denied to username.
fatal: Could not read from remote repository.
```

## 🛠️ Solutions

### Solution 1: Update Repository Settings (Repository Owner)

1. **Go to Repository Settings**
   - Navigate to https://github.com/barnesy/momentum
   - Click "Settings" tab
   - Select "Manage access" from the left sidebar

2. **Check Collaborator Permissions**
   - Ensure collaborators have "Write" access (not just "Read")
   - Click on each collaborator and verify their permission level

3. **Update Branch Protection Rules**
   - Go to Settings → Branches
   - If main branch is protected, ensure:
     - ✅ "Restrict who can push to matching branches" is unchecked OR
     - ✅ Collaborators are added to the allowed list
     - ✅ "Allow force pushes" and "Allow deletions" based on your needs

4. **Configure Default Permissions**
   - Settings → Actions → General
   - Under "Workflow permissions":
     - Select "Read and write permissions"
     - Check "Allow GitHub Actions to create and approve pull requests"

### Solution 2: Fork-Based Workflow (Recommended for Open Source)

If direct push access isn't desired, use a fork-based workflow:

1. **Collaborators Fork the Repository**
   ```bash
   # On GitHub, click "Fork" button
   # Then clone their fork:
   git clone https://github.com/THEIR_USERNAME/momentum.git
   cd momentum
   
   # Add upstream remote
   git remote add upstream https://github.com/barnesy/momentum.git
   ```

2. **Create Feature Branch**
   ```bash
   # Sync with upstream
   git fetch upstream
   git checkout -b feature/new-component upstream/main
   ```

3. **Push to Their Fork**
   ```bash
   git push origin feature/new-component
   ```

4. **Create Pull Request**
   - From their fork on GitHub
   - Target: barnesy/momentum:main

### Solution 3: Personal Access Token (If SSH Issues)

If collaborators have write access but still can't push:

1. **Generate Personal Access Token**
   - GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` scope

2. **Update Remote URL**
   ```bash
   git remote set-url origin https://TOKEN@github.com/barnesy/momentum.git
   ```

3. **Or Use SSH**
   ```bash
   # Check SSH key
   ssh -T git@github.com
   
   # Update remote to SSH
   git remote set-url origin git@github.com:barnesy/momentum.git
   ```

## 📋 Quick Checklist for Repository Owner

- [ ] Verify collaborators have "Write" access
- [ ] Check branch protection rules
- [ ] Consider if fork-based workflow is more appropriate
- [ ] Document preferred contribution method

## 🤝 Recommended Workflow

### For Core Team (Direct Access)
1. Add as collaborator with Write access
2. Clone repository directly
3. Create feature branches
4. Push and create PRs

### For External Contributors (Fork-Based)
1. Fork the repository
2. Create feature branches
3. Submit PRs from fork
4. Maintainers review and merge

## 📝 Testing Permissions

After updating settings, collaborators should test:

```bash
# Create test branch
git checkout -b test/permissions
echo "test" > test.txt
git add test.txt
git commit -m "test: Verify push permissions"
git push origin test/permissions

# If successful, delete test branch
git checkout main
git branch -D test/permissions
git push origin --delete test/permissions
```

## 🔍 Troubleshooting

### "Support for password authentication was removed"
Use Personal Access Token or SSH instead of password.

### "Permission denied (publickey)"
SSH key not set up. Either:
- Set up SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- Use HTTPS with Personal Access Token

### "Protected branch"
- Create feature branches instead of pushing to main
- Or update branch protection rules

## 📚 Resources

- [GitHub Docs: Repository Permissions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/managing-teams-and-people-with-access-to-your-repository)
- [GitHub Docs: About Forks](https://docs.github.com/en/get-started/quickstart/fork-a-repo)
- [GitHub Docs: Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)