/**
 * Route configuration for the Momentum Experiment application
 * Centralized route definitions following best practices
 */

import { lazy } from 'react';
import {
  Storage as StorageIcon,
  Dashboard as DashboardIcon,
  GitHub as GitHubIcon,
  Psychology as PsychologyIcon,
  BubbleChart as BubbleChartIcon,
  AccountTree as AccountTreeIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  NetworkCheck as NetworkCheckIcon,
  BugReport as BugReportIcon,
  Widgets as WidgetsIcon,
  Palette as PaletteIcon,
  Texture as TextureIcon,
  CollectionsBookmark as CollectionsBookmarkIcon,
  DataObject as DataObjectIcon,
  AccountBalance as AccountBalanceIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Lazy load all feature components for better performance
const SSEConnection = lazy(() => import('../components/Features/Connection/SSEConnection').then(m => ({ default: m.SSEConnection })));
const ContextManager = lazy(() => import('../components/Features/Context/ContextManager').then(m => ({ default: m.ContextManager })));
const AIIntegration = lazy(() => import('../components/Features/AI/AIIntegration').then(m => ({ default: m.AIIntegration })));
const GitHubIntegration = lazy(() => import('../components/Features/GitHub/GitHubIntegration').then(m => ({ default: m.GitHubIntegration })));
const NetworkTraffic = lazy(() => import('../components/Features/NetworkTraffic/NetworkTraffic').then(m => ({ default: m.NetworkTraffic })));
const ThemeEditor = lazy(() => import('../components/Features/ThemeEditor/ThemeEditor').then(m => ({ default: m.ThemeEditor })));
const ComponentGenerator = lazy(() => import('../components/Features/ComponentGenerator/ComponentGenerator').then(m => ({ default: m.ComponentGenerator })));
const PatternCatalog = lazy(() => import('../components/Features/PatternCatalog/PatternCatalog').then(m => ({ default: m.PatternCatalog })));
const DBMLEditor = lazy(() => import('../components/Features/DBMLEditor/DBMLEditor').then(m => ({ default: m.DBMLEditor })));
const BudgetingDashboard = lazy(() => import('../components/rejected/Budgeting/BudgetingDashboard').then(m => ({ default: m.BudgetingDashboard })));
const BudgetCategoryCardPreview = lazy(() => import('../components/approved/BudgetCategoryCardPreview').then(m => ({ default: m.BudgetCategoryCardPreview })));
const TailwindTest = lazy(() => import('../components/Features/TailwindTest/TailwindTest').then(m => ({ default: m.TailwindTest })));
const Onboarding = lazy(() => import('../components/Features/Onboarding/Onboarding').then(m => ({ default: m.Onboarding })));
const DataTableTest = lazy(() => import('../components/rejected/DashboardDataTable/TestPage').then(m => ({ default: m.default })));

export interface RouteConfig {
  id: string;
  path: string;
  label: string;
  icon: React.ReactElement;
  component: React.LazyExoticComponent<React.FC>;
  section: string;
  description?: string;
  isPending?: boolean;
  isRejected?: boolean;
  isHidden?: boolean;
  requiresAuth?: boolean;
  roles?: string[];
  children?: RouteConfig[];
}

export const ROUTE_PATHS = {
  HOME: '/',
  ONBOARDING: '/onboarding',
  CONNECTION: '/connection',
  CONTEXT: '/context',
  AI: '/ai',
  GITHUB: '/github',
  NETWORK_TRAFFIC: '/network-traffic',
  THEME_EDITOR: '/theme-editor',
  COMPONENT_GENERATOR: '/component-generator',
  PATTERN_GENERATOR: '/pattern-generator',
  PATTERN_CATALOG: '/pattern-catalog',
  DBML_EDITOR: '/dbml-editor',
  BUDGETING: '/budgeting',
  BUDGET_CATEGORY_PREVIEW: '/budget-category-preview',
  TAILWIND_TEST: '/tailwind-test',
  DATATABLE_TEST: '/datatable-test',
  NOT_FOUND: '/404',
} as const;

export const routes: RouteConfig[] = [
  // Getting Started
  {
    id: 'onboarding',
    path: ROUTE_PATHS.ONBOARDING,
    label: 'Getting Started',
    icon: <InfoIcon />,
    component: Onboarding,
    section: 'Getting Started',
    description: 'Learn how to use the Experimentation Lab',
  },
  
  
  // Network & Monitoring
  {
    id: 'network-traffic',
    path: ROUTE_PATHS.NETWORK_TRAFFIC,
    label: 'SSE Monitoring',
    icon: <NetworkCheckIcon />,
    component: NetworkTraffic,
    section: 'Monitoring',
    description: 'Real-time monitoring of GitHub App, server logs, and SSE traffic',
  },
  
  // Customization Tools
  {
    id: 'theme-editor',
    path: ROUTE_PATHS.THEME_EDITOR,
    label: 'Theme Editor',
    icon: <PaletteIcon />,
    component: ThemeEditor,
    section: 'Customization',
    description: 'Visual theme customization tool',
  },
  {
    id: 'component-generator',
    path: ROUTE_PATHS.COMPONENT_GENERATOR,
    label: 'Component Generator',
    icon: <TextureIcon />,
    component: ComponentGenerator,
    section: 'Customization',
    description: 'AI-powered component generation',
  },
  {
    id: 'pattern-catalog',
    path: ROUTE_PATHS.PATTERN_CATALOG,
    label: 'Pattern Catalog',
    icon: <CollectionsBookmarkIcon />,
    component: PatternCatalog,
    section: 'Customization',
    description: 'Reusable UI pattern library',
  },
  {
    id: 'dbml-editor',
    path: ROUTE_PATHS.DBML_EDITOR,
    label: 'DBML Schema Editor',
    icon: <DataObjectIcon />,
    component: DBMLEditor,
    section: 'Customization',
    description: 'Database schema design and visualization',
  },
  
  // Demonstrations
  {
    id: 'budgeting',
    path: ROUTE_PATHS.BUDGETING,
    label: 'Budgeting Dashboard',
    icon: <AccountBalanceIcon />,
    component: BudgetingDashboard,
    section: 'Demonstrations',
    description: 'Budget tracking demonstration',
    isRejected: true,
  },
  {
    id: 'budget-category-preview',
    path: ROUTE_PATHS.BUDGET_CATEGORY_PREVIEW,
    label: 'BudgetCategoryCard Preview',
    icon: <AccountBalanceIcon />,
    component: BudgetCategoryCardPreview,
    section: 'Demonstrations',
    description: 'Budget category card component preview',
  },
  {
    id: 'tailwind-test',
    path: ROUTE_PATHS.TAILWIND_TEST,
    label: 'Tailwind CSS Test',
    icon: <BugReportIcon />,
    component: TailwindTest,
    section: 'Demonstrations',
    description: 'Tailwind CSS integration test',
    isHidden: true,
  },
  {
    id: 'datatable-test',
    path: ROUTE_PATHS.DATATABLE_TEST,
    label: 'DataTable Test',
    icon: <DataObjectIcon />,
    component: DataTableTest,
    section: 'Demonstrations',
    description: 'Test the Dashboard DataTable Card component',
    isRejected: true,
  },
];

// Group routes by section for navigation
export const routesBySection = routes.reduce((acc, route) => {
  if (!route.isHidden) {
    if (!acc[route.section]) {
      acc[route.section] = [];
    }
    acc[route.section].push(route);
  }
  return acc;
}, {} as Record<string, RouteConfig[]>);

// Get route by path
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return routes.find(route => route.path === path);
};

// Get route by id
export const getRouteById = (id: string): RouteConfig | undefined => {
  return routes.find(route => route.id === id);
};

// Default route - show onboarding for new users
export const DEFAULT_ROUTE = localStorage.getItem('momentum-onboarding-completed') 
  ? ROUTE_PATHS.COMPONENT_GENERATOR 
  : ROUTE_PATHS.ONBOARDING;

// Protected routes (example)
export const protectedRoutes = routes.filter(route => route.requiresAuth);

// Public routes
export const publicRoutes = routes.filter(route => !route.requiresAuth);