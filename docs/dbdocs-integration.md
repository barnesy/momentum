# dbdocs.io Integration Guide

This guide explains how to use dbdocs.io to generate beautiful documentation for the Momentum project database schema.

## Overview

dbdocs.io is a database documentation tool that creates interactive, shareable documentation from DBML (Database Markup Language) files. The Momentum project includes a comprehensive DBML schema editor with built-in dbdocs.io integration.

## Features

- 📚 **Auto-generated Documentation** - Clean interface to visualize your database schema
- 🔗 **Shareable Links** - Share documentation with team members and stakeholders
- 📊 **Version Control** - Track database schema changes over time
- 🚀 **CI/CD Integration** - Automate documentation updates in your pipeline

## Quick Start

### 1. Install dbdocs CLI

```bash
npm install -g dbdocs
```

### 2. Login to dbdocs

```bash
dbdocs login
```

You'll be prompted to authenticate using your email or GitHub account.

### 3. Build Documentation

From the project root:

```bash
dbdocs build database.dbml --project momentum-db
```

### 4. View Documentation

After building, you'll receive a URL like:
```
https://dbdocs.io/your-username/momentum-db
```

## Using the DBML Editor

The Momentum project includes a comprehensive DBML editor at `/experiment` under "DBML Schema Editor":

1. **Edit Schema** - Modify the database schema with syntax highlighting and validation
2. **Schema Overview** - View tables, fields, relationships, and enums
3. **Export SQL** - Generate SQL for PostgreSQL, MySQL, or SQL Server
4. **Documentation Tab** - Access dbdocs.io integration and CLI guides

### Editor Features

- **Live Validation** - Real-time DBML syntax checking
- **Import/Export** - Upload existing DBML files or download current schema
- **Browser Storage** - Save schemas locally for quick access
- **Syntax Reference** - Built-in guide for DBML syntax

## CI/CD Integration

Add this to your CI pipeline to automatically update documentation:

```yaml
# .github/workflows/dbdocs.yml
name: Update Database Documentation

on:
  push:
    paths:
      - 'database.dbml'
    branches:
      - main

jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dbdocs
        run: npm install -g dbdocs
      
      - name: Build documentation
        env:
          DBDOCS_TOKEN: ${{ secrets.DBDOCS_TOKEN }}
        run: |
          dbdocs login --token $DBDOCS_TOKEN
          dbdocs build database.dbml --project momentum-db
```

## Project Schema

The Momentum project schema (`database.dbml`) includes:

- **7 Tables**: components, component_reviews, themes, github_connections, ai_interactions, users, performance_metrics
- **3 Enums**: component_status, review_status, user_role
- **Multiple Relationships**: Foreign keys and cascading deletes
- **Indexes**: Optimized for common queries

## Best Practices

1. **Keep Schema Updated** - Update `database.dbml` whenever you make database changes
2. **Use Version Control** - Commit schema changes with descriptive messages
3. **Review Before Publishing** - Use the editor's validation before pushing to dbdocs
4. **Document Tables** - Add `Note:` comments to tables and complex fields
5. **Share Wisely** - Use password protection for sensitive schemas

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   ```bash
   dbdocs logout
   dbdocs login
   ```

2. **Schema Validation Errors**
   - Use the DBML editor to validate your schema
   - Check for duplicate relationships
   - Ensure all referenced tables exist

3. **Project Not Found**
   - Ensure you're using the correct project name
   - Check your dbdocs account for existing projects

## Additional Resources

- [DBML Documentation](https://dbml.dbdiagram.io/docs)
- [dbdocs.io Website](https://dbdocs.io)
- [dbdiagram.io](https://dbdiagram.io) - Visual diagram generator
- [DBML VS Code Extension](https://marketplace.visualstudio.com/items?itemName=matt-meyers.vscode-dbml)

## Support

For issues specific to the Momentum project schema:
- Check the DBML editor's validation messages
- Review the syntax reference in the editor
- Open an issue in the Momentum repository

For dbdocs.io platform issues:
- Visit the [dbdiagram community](https://community.dbdiagram.io)
- Contact dbdocs support