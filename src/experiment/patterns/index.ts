// Data Display Components
export {
  UserProfileCard,
  UserProfileCardCompact,
  MetricsCard,
  MetricsCardCompact,
  DataTableCompact,
  UserList,
  StatsGrid,
} from './dataDisplay';

// Layout Components
export {
  HeaderWithActions,
  HeaderSimple,
  PageContainer,
  SectionDivider,
  TwoColumnLayout,
  SidebarLayout,
  AppHeader,
  CardGrid,
  EmptyState,
  LoadingState,
} from './layout';

// Form Components
export {
  FormFieldGroup,
  SearchBarWithFilters,
  LoginForm,
  FormSection,
  SettingsForm,
  FilterPanel,
  AutocompleteSearch,
} from './forms';

// Pattern metadata for catalog
export const patternCategories = {
  'Data Display': [
    'UserProfileCard',
    'UserProfileCardCompact',
    'MetricsCard',
    'MetricsCardCompact',
    'DataTableCompact',
    'UserList',
    'StatsGrid',
  ],
  'Layout': [
    'HeaderWithActions',
    'HeaderSimple',
    'PageContainer',
    'SectionDivider',
    'TwoColumnLayout',
    'SidebarLayout',
    'AppHeader',
    'CardGrid',
    'EmptyState',
    'LoadingState',
  ],
  'Forms': [
    'FormFieldGroup',
    'SearchBarWithFilters',
    'LoginForm',
    'FormSection',
    'SettingsForm',
    'FilterPanel',
    'AutocompleteSearch',
  ],
};

// Pattern descriptions for documentation
export const patternDescriptions = {
  // Data Display
  UserProfileCard: 'Displays user profile information with avatar, name, role, and optional actions',
  UserProfileCardCompact: 'Compact version of UserProfileCard with minimal spacing',
  MetricsCard: 'Displays a single metric with optional trend indicator',
  MetricsCardCompact: 'Compact metrics display for dashboards',
  DataTableCompact: 'Compact data table with hover effects',
  UserList: 'List of users with avatars and actions',
  StatsGrid: 'Grid of statistics with icons and trends',
  
  // Layout
  HeaderWithActions: 'Page header with title, subtitle, breadcrumbs, and action buttons',
  HeaderSimple: 'Simple page header with just title and optional back button',
  PageContainer: 'Consistent page container with proper spacing',
  SectionDivider: 'Section divider with optional title',
  TwoColumnLayout: 'Responsive two-column layout',
  SidebarLayout: 'Layout with fixed sidebar and scrollable content',
  AppHeader: 'Application header with navigation',
  CardGrid: 'Responsive grid for cards',
  EmptyState: 'Empty state with icon, message, and optional action',
  LoadingState: 'Centered loading indicator with optional message',
  
  // Forms
  FormFieldGroup: 'Group of form fields with consistent spacing',
  SearchBarWithFilters: 'Search input with filter chips',
  LoginForm: 'Standard login form with email and password',
  FormSection: 'Section wrapper for forms with title and description',
  SettingsForm: 'Form for various settings with switches and selects',
  FilterPanel: 'Collapsible filter panel with various input types',
  AutocompleteSearch: 'Autocomplete search with async loading',
};