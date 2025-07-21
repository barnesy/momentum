# Claude Component Patterns Guide

## Overview
This guide helps Claude (and other AI assistants) generate consistent, high-quality Material-UI components for this project. All components should be composed using ONLY existing MUI components.

## 🎨 Component Generation Workflow

### File-Based Component Review System

Components are organized in four folders based on their review status:
- `src/experiment/components/pending/` - New components awaiting review
- `src/experiment/components/approved/` - Components approved but not yet in production
- `src/experiment/components/rejected/` - Components needing rework
- `src/experiment/components/Features/` - Production-ready components

### Creating New Components

When asked to create components:

1. **Create production-ready TypeScript components** in the `pending/` folder
2. **Include proper TypeScript interfaces** for all props
3. **Use only Material-UI components** - no custom HTML elements
4. **Create an index.ts file** to export all components
5. **Update navigation** if creating a new feature section

Example workflow:
```
User: "Create budgeting card components"

Claude:
1. Creates folder: src/experiment/components/pending/Budgeting/
2. Creates components: BudgetOverviewCard.tsx, ExpenseTrackerCard.tsx, etc.
3. Creates index.ts with exports
4. Updates navigation to include new section
```

### Component Iteration Workflow

When users request changes to components:

1. **Direct file editing** - Update the component file directly
2. **Instant feedback** - Changes appear immediately in the Component Review Dashboard
3. **Maintain TypeScript** - Keep all type safety intact

Example iteration:
```
User: "BudgetOverviewCard more condensed"

Claude:
1. Reads the existing component file
2. Makes the requested changes (reduces spacing, combines elements)
3. Updates the file directly
4. Component automatically updates in the review dashboard
```

### Quick Modification Patterns

- **"Make it compact"** → Reduce padding, combine elements, smaller fonts
- **"Add [feature]"** → Add the feature while maintaining existing functionality
- **"More visual"** → Add icons, colors, or charts
- **"Simplify"** → Remove non-essential elements
- **"Production ready"** → Add loading states, error handling, empty states

### Component Review Dashboard

The Component Generator (`/component-generator`) displays:
- **Three tabs**: Pending, Approved, Rejected
- **Live previews** with realistic demo data
- **File paths** for each component
- **Status badges** showing review state
- **Copy import** functionality

Components are manually listed in `ComponentGenerator.tsx` until moved to production.

## Component Naming Convention

Components should have descriptive, human-friendly names that clearly indicate their purpose:

### Naming Patterns
- **[Type][Purpose][Variant]**
  - `UserProfileCard` - displays user profile information
  - `UserProfileCardCompact` - compact variant
  - `MetricsCard` - displays a single metric
  - `MetricsCardWithTrend` - metric with trend indicator
  - `HeaderWithActions` - page header with action buttons
  - `HeaderSimple` - basic page header

### Categories
- **Data Display**: Card, List, Table, Stats
- **Layout**: Header, Footer, Sidebar, Grid
- **Forms**: Field, Input, Select, Search
- **Feedback**: Alert, Dialog, Notification
- **Navigation**: Menu, Tabs, Breadcrumbs

## Component Structure

Every component should follow this structure:

```tsx
/**
 * @component ComponentName
 * @category Category
 * @description Brief description of what the component does
 */
export const ComponentName = ({ prop1, prop2, ...props }) => {
  return (
    <MuiComponent>
      {/* Component content */}
    </MuiComponent>
  );
};
```

## Material-UI Usage Rules

1. **Use ONLY MUI components** - No custom HTML elements
2. **Style with sx prop** - No inline styles or CSS classes
3. **Responsive by default** - Use responsive values: `sx={{ p: { xs: 2, md: 3 } }}`
4. **Theme-aware** - Use theme colors: `color="primary"`, `bgcolor="background.paper"`
5. **Consistent spacing** - Use theme spacing: `spacing={2}`, `gap={2}`

## Common Patterns

### UserProfileCard
```tsx
export const UserProfileCard = ({ name, role, email, avatar, status, onEdit }) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={avatar} alt={name}>
            {name?.[0]}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6">{name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {role}
            </Typography>
          </Box>
          {status && (
            <Chip 
              label={status} 
              size="small"
              color={status === 'active' ? 'success' : 'default'}
            />
          )}
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          {email}
        </Typography>
        {onEdit && (
          <Button size="small" onClick={onEdit} sx={{ mt: 1 }}>
            Edit Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
```

### MetricsCard
```tsx
export const MetricsCard = ({ title, value, trend, icon }) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                {trend > 0 ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography 
                  variant="body2" 
                  color={trend > 0 ? 'success.main' : 'error.main'}
                >
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          {icon && (
            <Box sx={{ color: 'primary.main' }}>
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
```

### HeaderWithActions
```tsx
export const HeaderWithActions = ({ title, subtitle, breadcrumbs, actions }) => {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs && (
        <Breadcrumbs sx={{ mb: 2 }}>
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
              href={crumb.href}
              underline="hover"
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {actions && (
          <Stack direction="row" spacing={2}>
            {actions}
          </Stack>
        )}
      </Box>
    </Box>
  );
};
```

### DataTableCompact
```tsx
export const DataTableCompact = ({ columns, rows, onRowClick }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.field}>
                {column.headerName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={row.id || index}
              hover
              onClick={() => onRowClick?.(row)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((column) => (
                <TableCell key={column.field}>
                  {row[column.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
```

### FormFieldGroup
```tsx
export const FormFieldGroup = ({ fields, values, onChange }) => {
  return (
    <Stack spacing={3}>
      {fields.map((field) => (
        <TextField
          key={field.name}
          name={field.name}
          label={field.label}
          type={field.type || 'text'}
          value={values[field.name] || ''}
          onChange={onChange}
          required={field.required}
          helperText={field.helperText}
          fullWidth
          variant="outlined"
        />
      ))}
    </Stack>
  );
};
```

### SearchBarWithFilters
```tsx
export const SearchBarWithFilters = ({ onSearch, filters, onFilterChange }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          placeholder="Search..."
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          onChange={(e) => onSearch(e.target.value)}
        />
        {filters && (
          <Stack direction="row" spacing={1}>
            {filters.map((filter) => (
              <Chip
                key={filter.value}
                label={filter.label}
                onClick={() => onFilterChange(filter)}
                color={filter.active ? 'primary' : 'default'}
                variant={filter.active ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
```

## Component Variations

When creating variations, append descriptive suffixes:
- `Compact` - Reduced spacing/size
- `WithIcon` - Includes icon
- `Expandable` - Can be expanded/collapsed
- `Loading` - Shows loading state
- `Empty` - Shows empty state

Example:
- `UserProfileCard`
- `UserProfileCardCompact`
- `UserProfileCardWithActions`
- `UserProfileCardLoading`

## Best Practices

1. **Props over Variants** - Make components flexible with props rather than creating many variants
2. **Composition** - Combine smaller components to create complex UIs
3. **Accessibility** - Include proper ARIA labels and keyboard navigation
4. **Performance** - Use React.memo for expensive components
5. **Type Safety** - Define clear prop interfaces (even in JS, use JSDoc comments)

## Testing Components

When asked to test or demonstrate a component, provide:
1. The component code
2. Example usage with different props
3. Common variations
4. Integration examples

## Communication

When referencing components in conversation:
- Use the full component name: "Update the UserProfileCard"
- Reference specific props: "Add an avatar prop to MetricsCard"
- Describe variations clearly: "Create a compact version of HeaderWithActions"