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
  BugReport as BugReportIcon,
  Widgets as WidgetsIcon,
  Palette as PaletteIcon,
  Texture as TextureIcon,
  CollectionsBookmark as CollectionsBookmarkIcon,
  DataObject as DataObjectIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';

// Lazy load all feature components for better performance
const SSEConnection = lazy(() => import('../components/Features/Connection/SSEConnection').then(m => ({ default: m.SSEConnection })));
const ContextManager = lazy(() => import('../components/Features/Context/ContextManager').then(m => ({ default: m.ContextManager })));
const AIIntegration = lazy(() => import('../components/Features/AI/AIIntegration').then(m => ({ default: m.AIIntegration })));
const GitHubIntegration = lazy(() => import('../components/Features/GitHub/GitHubIntegration').then(m => ({ default: m.GitHubIntegration })));
const Performance = lazy(() => import('../components/Features/Performance/Performance').then(m => ({ default: m.Performance })));
const ThemeEditor = lazy(() => import('../components/Features/ThemeEditor/ThemeEditor').then(m => ({ default: m.ThemeEditor })));
const ComponentGenerator = lazy(() => import('../components/Features/ComponentGenerator/ComponentGenerator').then(m => ({ default: m.ComponentGenerator })));
const PatternCatalog = lazy(() => import('../components/Features/PatternCatalog/PatternCatalog').then(m => ({ default: m.PatternCatalog })));
const DBMLEditor = lazy(() => import('../components/Features/DBMLEditor/DBMLEditor').then(m => ({ default: m.DBMLEditor })));
const BudgetingDashboard = lazy(() => import('../components/rejected/Budgeting/BudgetingDashboard').then(m => ({ default: m.BudgetingDashboard })));
const BudgetCategoryCardPreview = lazy(() => import('../components/approved/BudgetCategoryCardPreview').then(m => ({ default: m.BudgetCategoryCardPreview })));
const TailwindTest = lazy(() => import('../components/Features/TailwindTest/TailwindTest').then(m => ({ default: m.TailwindTest })));

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
  CONNECTION: '/connection',
  CONTEXT: '/context',
  AI: '/ai',
  GITHUB: '/github',
  PERFORMANCE: '/performance',
  THEME_EDITOR: '/theme-editor',
  COMPONENT_GENERATOR: '/component-generator',
  PATTERN_GENERATOR: '/pattern-generator',
  PATTERN_CATALOG: '/pattern-catalog',
  DBML_EDITOR: '/dbml-editor',
  BUDGETING: '/budgeting',
  BUDGET_CATEGORY_PREVIEW: '/budget-category-preview',
  TAILWIND_TEST: '/tailwind-test',
  NOT_FOUND: '/404',
} as const;

export const routes: RouteConfig[] = [
  // Core Features
  {
    id: 'connection',
    path: ROUTE_PATHS.CONNECTION,
    label: 'SSE Connection',
    icon: <BubbleChartIcon />,
    component: SSEConnection,
    section: 'Core Features',
    description: 'Server-Sent Events connection management',
  },
  {
    id: 'context',
    path: ROUTE_PATHS.CONTEXT,
    label: 'Context Manager',
    icon: <AccountTreeIcon />,
    component: ContextManager,
    section: 'Core Features',
    description: 'Application context and state management',
  },
  {
    id: 'ai',
    path: ROUTE_PATHS.AI,
    label: 'AI Integration',
    icon: <PsychologyIcon />,
    component: AIIntegration,
    section: 'Core Features',
    description: 'Claude AI integration and chat interface',
  },
  {
    id: 'github',
    path: ROUTE_PATHS.GITHUB,
    label: 'GitHub Integration',
    icon: <GitHubIcon />,
    component: GitHubIntegration,
    section: 'Core Features',
    description: 'GitHub webhook and API integration',
  },
  
  // Performance & Monitoring
  {
    id: 'performance',
    path: ROUTE_PATHS.PERFORMANCE,
    label: 'Performance Monitor',
    icon: <SpeedIcon />,
    component: Performance,
    section: 'Monitoring',
    description: 'Real-time performance metrics and monitoring',
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
    icon: () => createElement(AccountBalanceIcon),
    component: BudgetingDashboard,
    section: 'Demonstrations',
    description: 'Budget tracking demonstration',
    isRejected: true,
  },
  {
    id: 'budget-category-preview',
    path: ROUTE_PATHS.BUDGET_CATEGORY_PREVIEW,
    label: 'BudgetCategoryCard Preview',
    icon: () => createElement(AccountBalanceIcon),
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

// Default route
export const DEFAULT_ROUTE = ROUTE_PATHS.DBML_EDITOR;

// Protected routes (example)
export const protectedRoutes = routes.filter(route => route.requiresAuth);

// Public routes
export const publicRoutes = routes.filter(route => !route.requiresAuth);