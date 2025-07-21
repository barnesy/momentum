# Component Review Process

This document outlines the review workflow for new components in the Momentum Experimentation Lab.

## Folder Structure

```
src/experiment/components/
├── pending/          # Components awaiting review
├── approved/         # Components approved but not yet in production
├── rejected/         # Components that need rework
└── Features/         # Production-ready components
```

## Workflow

### 1. Component Creation
- All new components are initially placed in the `pending/` folder
- Each component should have its own folder with:
  - Component files (`.tsx`)
  - Type definitions (if needed)
  - Index file for exports
  - Tests (optional but recommended)

### 2. Review Process
Components in `pending/` are reviewed for:
- **Code Quality**: Clean, maintainable code following project standards
- **Material-UI Compliance**: Proper use of MUI components and theme
- **TypeScript**: Proper typing and interfaces
- **Performance**: No obvious performance issues
- **Accessibility**: Basic a11y considerations
- **Reusability**: Component is properly abstracted

### 3. Review Outcomes

#### ✅ Approved (Staging)
- Move component folder from `pending/` to `approved/`
- Component has passed code review but awaits final integration
- Can be tested in isolation before production deployment

#### 🚀 Production Ready
- Move component folder from `approved/` to `Features/`
- Update any imports in the main app
- Component is fully integrated and production-ready

#### ❌ Rejected
- Move component folder from `pending/` to `rejected/`
- Add a `REJECTION_NOTES.md` file explaining:
  - What needs to be fixed
  - Specific issues found
  - Suggestions for improvement
- Developer can rework and resubmit to `pending/`

#### 🔄 Needs Minor Changes
- Keep in `pending/`
- Add review comments as a `REVIEW_COMMENTS.md` file
- Developer addresses comments and updates the PR

## Current Components in Review

### Pending
- None currently

### Approved (Staging)
- **BudgetCategoryCard** - Category-wise budget tracking with visual indicators

### Rejected
- **Budgeting/BudgetOverviewCard** - Needs error handling, loading states, accessibility
- **Budgeting/ExpenseTrackerCard** - Needs pagination, empty state, i18n
- **Budgeting/BudgetProgressCard** - Needs period flexibility, better projections
- **Budgeting/FinancialGoalCard** - Needs date validation, currency support

*See `rejected/Budgeting/REJECTION_NOTES.md` for detailed feedback*

### Production (in Features/)
- AIIntegration
- ComponentGenerator
- Connection
- Context
- GitHub
- Performance
- ThemeEditor
- PatternCatalog
- DBMLEditor

## Review Checklist

- [ ] Component follows naming conventions
- [ ] Props are properly typed with interfaces
- [ ] Component is responsive (mobile-friendly)
- [ ] Uses theme colors and spacing
- [ ] No hardcoded values (use theme/props)
- [ ] Handles loading/error states appropriately
- [ ] Includes JSDoc comments for complex props
- [ ] Exports are properly organized in index file
- [ ] No console.logs or debugging code
- [ ] Component is reasonably performant

## Example Review Comment

```markdown
# REVIEW_COMMENTS.md

## BudgetOverviewCard
- ✅ Good use of Material-UI components
- ✅ Proper TypeScript interfaces
- ⚠️ Consider adding loading state
- ❌ Missing error boundary
- 💡 Could benefit from memoization for expensive calculations
```

## Moving Components

```bash
# Approve a component (to staging)
mv src/experiment/components/pending/ComponentName src/experiment/components/approved/

# Move to production
mv src/experiment/components/approved/ComponentName src/experiment/components/Features/

# Reject a component
mv src/experiment/components/pending/ComponentName src/experiment/components/rejected/

# Resubmit after fixes
mv src/experiment/components/rejected/ComponentName src/experiment/components/pending/
```

Remember to update imports after moving components!