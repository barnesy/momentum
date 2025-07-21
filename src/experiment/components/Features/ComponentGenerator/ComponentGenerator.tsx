import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  Alert,
  Stack,
  Button,
  Collapse,
  Badge,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Code as CodeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';

// Import components dynamically based on their state
import * as PendingComponents from '../../pending';
import * as ApprovedComponents from '../../approved';
import * as RejectedComponents from '../../rejected';

interface ComponentInfo {
  name: string;
  component: React.ComponentType<any>;
  path: string;
  hasDemo?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`component-tabpanel-${index}`}
      aria-labelledby={`component-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const ComponentGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showCode, setShowCode] = useState<Record<string, boolean>>({});
  const [showRules, setShowRules] = useState(true);

  // Component collections by state
  const pendingComponents: ComponentInfo[] = [
    {
      name: 'DashboardDataTableCard',
      component: PendingComponents.DashboardDataTableCard || (() => <div>Component not found</div>),
      path: 'pending/DashboardDataTableCard',
      hasDemo: true,
    },
    {
      name: 'DashboardDataTableCardDemo',
      component: PendingComponents.DashboardDataTableCardDemo || (() => <div>Component not found</div>),
      path: 'pending/DashboardDataTableCardDemo',
      hasDemo: true,
    },
    {
      name: 'TestPage',
      component: PendingComponents.TestPage || (() => <div>Component not found</div>),
      path: 'pending/TestPage',
      hasDemo: true,
    },
  ];

  const approvedComponents: ComponentInfo[] = [
    {
      name: 'BudgetCategoryCard',
      component: ApprovedComponents.BudgetCategoryCard || (() => <div>Component not found</div>),
      path: 'approved/BudgetCategoryCard',
      hasDemo: true,
    },
  ];

  const rejectedComponents: ComponentInfo[] = [
    {
      name: 'BudgetOverviewCard',
      component: RejectedComponents.BudgetOverviewCard || (() => <div>Component not found</div>),
      path: 'rejected/Budgeting/BudgetOverviewCard',
      hasDemo: true,
    },
    {
      name: 'ExpenseTrackerCard',
      component: RejectedComponents.ExpenseTrackerCard || (() => <div>Component not found</div>),
      path: 'rejected/Budgeting/ExpenseTrackerCard',
      hasDemo: true,
    },
    {
      name: 'BudgetProgressCard',
      component: RejectedComponents.BudgetProgressCard || (() => <div>Component not found</div>),
      path: 'rejected/Budgeting/BudgetProgressCard',
      hasDemo: true,
    },
    {
      name: 'FinancialGoalCard',
      component: RejectedComponents.FinancialGoalCard || (() => <div>Component not found</div>),
      path: 'rejected/Budgeting/FinancialGoalCard',
      hasDemo: true,
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const toggleCodeView = (componentName: string) => {
    setShowCode(prev => ({ ...prev, [componentName]: !prev[componentName] }));
  };

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(`import { ComponentName } from '@/experiment/components/${path}';`);
  };

  const renderComponentCard = (info: ComponentInfo, status: 'pending' | 'approved' | 'rejected') => {
    const Component = info.component;
    const statusConfig = {
      pending: { color: 'warning', icon: <ScheduleIcon />, label: 'Pending Review' },
      approved: { color: 'success', icon: <CheckCircleIcon />, label: 'Approved' },
      rejected: { color: 'error', icon: <CancelIcon />, label: 'Rejected' },
    };

    const config = statusConfig[status];

    // Demo props for components
    const demoProps: Record<string, any> = {
      BudgetOverviewCard: { totalBudget: 5000, spent: 3245 },
      BudgetCategoryCard: {
        categories: [
          { name: 'Housing', budget: 1500, spent: 1500, icon: '🏠' },
          { name: 'Food', budget: 600, spent: 452, icon: '🍕' },
          { name: 'Transport', budget: 400, spent: 380, icon: '🚗' },
        ],
      },
      ExpenseTrackerCard: {
        expenses: [
          { id: 1, description: 'Grocery Store', amount: 125.43, category: 'Food', date: '2025-01-20' },
          { id: 2, description: 'Gas Station', amount: 65.00, category: 'Transport', date: '2025-01-19' },
        ],
      },
      BudgetProgressCard: { monthlyGoal: 5000, currentSpending: 3245 },
      FinancialGoalCard: {
        goals: [
          { id: 1, name: 'Emergency Fund', target: 10000, current: 7500, deadline: '2025-06-30' },
          { id: 2, name: 'Vacation', target: 3000, current: 1200, deadline: '2025-08-15' },
        ],
      },
      DashboardDataTableCard: {
        title: 'User Management',
        subtitle: 'Manage user accounts and permissions',
        data: [
          { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', department: 'Engineering', performance: 95 },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', status: 'Active', department: 'Marketing', performance: 88 },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Developer', status: 'Inactive', department: 'Engineering', performance: 92 },
        ],
        columns: [
          { field: 'name', headerName: 'Name', sortable: true },
          { field: 'role', headerName: 'Role', sortable: true },
          { field: 'department', headerName: 'Department', sortable: true },
          { field: 'status', headerName: 'Status', sortable: true },
          { field: 'performance', headerName: 'Performance', sortable: true },
        ],
        showSearch: true,
        showFilters: true,
        showActions: true,
        showPagination: true,
      },
      DashboardDataTableCardDemo: {}, // This component renders its own demo
      TestPage: {}, // This component renders its own demo
    };

    return (
      <Grid size={{ xs: 12, md: 6 }} key={info.name}>
        <Paper
          elevation={2}
          sx={{
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6">{info.name}</Typography>
              <Chip
                label={config.label}
                color={config.color as any}
                size="small"
                icon={config.icon}
                sx={{ mt: 0.5 }}
              />
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Toggle Code View">
                <IconButton onClick={() => toggleCodeView(info.name)} size="small">
                  <CodeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copy Import Path">
                <IconButton onClick={() => copyPath(info.path)} size="small">
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* File Path */}
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            <FolderIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            {info.path}
          </Typography>

          {/* Component Preview */}
          {info.hasDemo && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                bgcolor: 'background.default',
                flexGrow: 1,
                overflow: 'auto',
              }}
            >
              <Component {...(demoProps[info.name] || {})} />
            </Paper>
          )}

          {/* Code View */}
          <Collapse in={showCode[info.name]}>
            <Alert severity="info" sx={{ mt: 2 }}>
              View component source at: <code>src/experiment/components/{info.path}.tsx</code>
            </Alert>
          </Collapse>
        </Paper>
      </Grid>
    );
  };

  return (
    <Box>
      {/* Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" color="primary">
              🎨 Component Review Dashboard
            </Typography>
            <Button
              onClick={() => setShowRules(!showRules)}
              startIcon={showRules ? <VisibilityOffIcon /> : <VisibilityIcon />}
            >
              {showRules ? 'Hide' : 'Show'} Guidelines
            </Button>
          </Box>

          <Collapse in={showRules}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'primary.50',
                borderRadius: 2,
                border: 2,
                borderColor: 'primary.main',
                borderStyle: 'dashed',
              }}
            >
              <Typography variant="h6" gutterBottom color="primary.dark">
                Component Review Process
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="primary.dark">
                      📁 Pending Components
                    </Typography>
                    <Typography variant="body2">
                      New components awaiting review. Check code quality, MUI compliance, and TypeScript usage.
                    </Typography>
                  </Stack>
                </Grid>
                
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="success.dark">
                      ✅ Approved Components
                    </Typography>
                    <Typography variant="body2">
                      Components that passed review and are staged for production. Final testing before deployment.
                    </Typography>
                  </Stack>
                </Grid>
                
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="error.dark">
                      ❌ Rejected Components
                    </Typography>
                    <Typography variant="body2">
                      Components that need improvements. Check rejection notes for required changes.
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Collapse>
        </CardContent>
      </Card>

      {/* Component Tabs */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab
                label={
                  <Badge badgeContent={pendingComponents.length} color="warning">
                    <Box sx={{ pr: 2 }}>Pending</Box>
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge badgeContent={approvedComponents.length} color="success">
                    <Box sx={{ pr: 2 }}>Approved</Box>
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge badgeContent={rejectedComponents.length} color="error">
                    <Box sx={{ pr: 2 }}>Rejected</Box>
                  </Badge>
                }
              />
            </Tabs>
          </Box>

          {/* Pending Components */}
          <TabPanel value={activeTab} index={0}>
            {pendingComponents.length > 0 ? (
              <Grid container spacing={3}>
                {pendingComponents.map(comp => renderComponentCard(comp, 'pending'))}
              </Grid>
            ) : (
              <Alert severity="info">No components pending review</Alert>
            )}
          </TabPanel>

          {/* Approved Components */}
          <TabPanel value={activeTab} index={1}>
            {approvedComponents.length > 0 ? (
              <Grid container spacing={3}>
                {approvedComponents.map(comp => renderComponentCard(comp, 'approved'))}
              </Grid>
            ) : (
              <Alert severity="info">No approved components yet</Alert>
            )}
          </TabPanel>

          {/* Rejected Components */}
          <TabPanel value={activeTab} index={2}>
            {rejectedComponents.length > 0 ? (
              <Grid container spacing={3}>
                {rejectedComponents.map(comp => renderComponentCard(comp, 'rejected'))}
              </Grid>
            ) : (
              <Alert severity="info">No rejected components</Alert>
            )}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export { ComponentGenerator };