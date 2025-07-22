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

### 2. Component Generator Integration
- New components are automatically added to the Component Generator
- Components appear in the "Pending" tab for review
- Demo components show multiple configurations and use cases
- Test pages provide direct access for testing functionality

### 3. Accessing Components for Review
- **Component Generator**: http://localhost:5173/src/experiment/component-generator
  - Navigate to "Pending" tab to see new components
  - Use 👍 to approve or 👎 to reject components
  - **Code View Toggle**: Click the code icon (<>) to view minimal component examples with syntax highlighting
  - View live demo implementations
  - Copy import paths with one click
- **Direct Test Routes**: Components may have dedicated test routes
  - Example: http://localhost:5173/src/experiment/datatable-test
- **Navigation**: Use sidebar to access test pages under "Demonstrations"

#### Code View Features
- **Toggle Code View**: Each component card has a code icon button that reveals:
  - Minimal, ready-to-use component example
  - Syntax-highlighted TypeScript/TSX code
  - Line numbers for easy reference
  - Properly formatted props with correct types
  - Import statement ready to copy
- **Smart Code Generation**:
  - Simple props displayed inline
  - Complex props (arrays, objects) properly formatted with indentation
  - Type-safe examples that match actual component interfaces
  - Clean, production-ready code snippets

### 4. Review Process
Components in `pending/` are reviewed for:
- **Code Quality**: Clean, maintainable code following project standards
- **Material-UI Compliance**: Proper use of MUI components and theme
- **TypeScript**: Proper typing and interfaces
- **Performance**: No obvious performance issues
- **Accessibility**: Basic a11y considerations
- **Reusability**: Component is properly abstracted

### 5. Review Outcomes

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
- **DashboardDataTableCard** - Comprehensive dashboard data table component with search, sorting, pagination, and action buttons
- **DashboardDataTableCardDemo** - Full demonstration component showing multiple configurations and use cases
- **TestPage** - Simple test implementation for the DashboardDataTableCard component

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
- [ ] **Code View displays correctly**: Minimal example generates properly
- [ ] **Syntax highlighting works**: Code is readable with proper color coding
- [ ] **Props formatting**: Complex props display with correct indentation

## Special Review Criteria for DataTable Components

### DashboardDataTableCard
- [ ] **Data Handling**: Properly handles empty data, loading states, and errors
- [ ] **Sorting**: Column sorting works correctly and maintains state
- [ ] **Search**: Search functionality filters across all relevant fields
- [ ] **Pagination**: Pagination controls work correctly with large datasets
- [ ] **Actions**: Edit/delete actions are properly isolated and don't trigger row clicks
- [ ] **Accessibility**: Table headers are properly labeled, keyboard navigation works
- [ ] **Performance**: Handles large datasets without performance issues
- [ ] **Customization**: Props allow sufficient customization without breaking functionality
- [ ] **Mobile Responsive**: Table adapts well to smaller screens
- [ ] **Theme Integration**: Uses theme colors and spacing consistently

### Demo Components
- [ ] **Comprehensive Examples**: Shows multiple use cases and configurations
- [ ] **Realistic Data**: Uses realistic sample data that demonstrates features
- [ ] **Interactive Elements**: Demonstrates all interactive features
- [ ] **Documentation**: Clear examples of how to use the component
- [ ] **Edge Cases**: Shows how component handles edge cases (empty data, errors, etc.)

## Component Generator Features

### Code View Toggle
The Component Generator now includes an integrated code viewer that provides:

1. **Instant Code Examples**
   - Click the code icon (<>) on any component card
   - View a minimal, working example with all required props
   - Copy-paste ready code that follows best practices

2. **Syntax Highlighting**
   - Full TypeScript/TSX syntax highlighting
   - Theme-aware colors (light/dark mode support)
   - Line numbers for easy reference
   - Proper highlighting for:
     - Keywords (import, export, const, return)
     - Types and interfaces
     - JSX/TSX components and attributes
     - Strings, numbers, and operators
     - Object properties and methods

3. **Smart Code Generation**
   ```tsx
   // Simple props example:
   <ComponentName title="Example" count={42} active />
   
   // Complex props with proper formatting:
   <ComponentName
     categories={[
       {
         name: "Category 1",
         value: 100,
         icon: "📊"
       },
       {
         name: "Category 2",
         value: 200,
         icon: "📈"
       }
     ]}
   />
   ```

4. **Developer Experience**
   - One-click copy for import statements
   - Collapsible code view to save space
   - Shows both minimal example and full source path
   - Responsive design works on all screen sizes

### Using the Code View for Review

When reviewing components:
1. Toggle the code view to see how the component will be used
2. Check that the generated example matches the component's intended API
3. Verify prop types are correctly represented in the example
4. Ensure complex data structures are formatted readably
5. Confirm the import path is correct

## Component-Specific Review Notes

### DashboardDataTableCard Features
- **Search & Filter**: Built-in search functionality across all data fields
- **Sorting**: Click column headers to sort data (ascending/descending)
- **Pagination**: Navigate through large datasets with configurable page sizes
- **Loading States**: Progress indicators and loading messages
- **Error Handling**: Error display with retry functionality
- **Action Buttons**: Edit, delete, add, export actions with proper event isolation
- **Responsive Design**: Adapts to different screen sizes
- **Customizable**: Toggle features on/off via props
- **Theme Integration**: Uses Material-UI theme colors and spacing

### Demo Component Features
- **Multiple Configurations**: Shows different use cases and setups
- **Interactive Examples**: Demonstrates all interactive features
- **Realistic Data**: Uses sample data that represents real-world scenarios
- **Edge Case Handling**: Shows loading, error, and empty states
- **Documentation**: Clear examples of component usage

## Example Review Comment

```markdown
# REVIEW_COMMENTS.md

## DashboardDataTableCard
- ✅ Excellent Material-UI integration and theme usage
- ✅ Comprehensive TypeScript interfaces and proper typing
- ✅ Good handling of loading and error states
- ✅ Responsive design works well on mobile
- ✅ Search and sorting functionality works correctly
- ⚠️ Consider adding keyboard navigation for accessibility
- ⚠️ Could benefit from virtual scrolling for very large datasets
- 💡 Consider adding column resizing functionality
- 💡 Could add export functionality for filtered/sorted data

## DashboardDataTableCardDemo
- ✅ Comprehensive examples showing multiple use cases
- ✅ Realistic sample data that demonstrates features well
- ✅ Good coverage of edge cases (loading, errors, empty states)
- ✅ Interactive examples work correctly
- ⚠️ Consider adding more accessibility examples
- 💡 Could add examples of custom column renderers
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

## Best Practices for Component Development

### Creating Review-Friendly Components

1. **Design for the Code View**
   - Ensure your component has sensible default props
   - Use descriptive prop names that are self-documenting
   - Group related props into objects when it makes sense
   - Avoid overly complex prop structures that are hard to demonstrate

2. **Example-Driven Development**
   - Think about how the minimal example will look
   - Provide good demo data in the Component Generator
   - Make sure the component works with the example props
   - Test that the generated code actually runs

3. **Documentation Through Code**
   - The code view example serves as living documentation
   - Make prop interfaces clear and intuitive
   - Use TypeScript types to communicate intent
   - Add JSDoc comments for complex props that will help reviewers

4. **Review Process Integration**
   - Always check the code view during review
   - Ensure the generated example represents best practices
   - Verify that complex props are formatted readably
   - Test copying and using the generated code

### Component Generator Configuration

When adding a new component to the Component Generator:

```typescript
// In ComponentGenerator.tsx, add demo props:
const demoProps: Record<string, any> = {
  YourComponent: {
    title: 'Example Title',
    items: [
      { id: 1, name: 'Item 1', value: 100 },
      { id: 2, name: 'Item 2', value: 200 }
    ],
    onAction: () => console.log('Action triggered'),
    config: {
      theme: 'light',
      showHeader: true
    }
  }
};
```

This ensures that:
- The component renders properly in the preview
- The code view generates a realistic example
- Reviewers can see how the component is intended to be used
- The syntax highlighter can properly format the code

## Approval Workflow for DataTable Components

### Step 1: Review in Component Generator
1. Navigate to http://localhost:5173/src/experiment/component-generator
2. Go to the "Pending" tab
3. Review each component:
   - **DashboardDataTableCard**: Test search, sorting, pagination, and actions
   - **DashboardDataTableCardDemo**: Check all example configurations
   - **TestPage**: Verify basic functionality

### Step 2: Test Direct Routes
1. Visit http://localhost:5173/src/experiment/datatable-test
2. Test all interactive features
3. Verify responsive behavior on different screen sizes

### Step 3: Code Review
1. Check TypeScript interfaces and prop types
2. Verify Material-UI theme integration
3. Review error handling and loading states
4. Test accessibility features

### Step 4: Approval Decision
- **Approve**: Move to `approved/` folder for staging
- **Reject**: Move to `rejected/` with detailed feedback
- **Minor Changes**: Keep in `pending/` with specific comments

### Step 5: Integration
- Update Component Generator imports
- Add to production routes if needed
- Update documentation and examples