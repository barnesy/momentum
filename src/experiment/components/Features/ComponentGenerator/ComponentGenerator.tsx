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
import { SyntaxHighlighter } from './SyntaxHighlighter';

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
      name: 'WorkflowCardCompact',
      component: PendingComponents.WorkflowCardCompact || (() => <div>Component not found</div>),
      path: 'pending/Workflow/WorkflowCardCompact',
      hasDemo: true,
    },
    {
      name: 'WorkflowCardStandard',
      component: PendingComponents.WorkflowCardStandard || (() => <div>Component not found</div>),
      path: 'pending/Workflow/WorkflowCardStandard',
      hasDemo: true,
    },
    {
      name: 'WorkflowCardExpanded',
      component: PendingComponents.WorkflowCardExpanded || (() => <div>Component not found</div>),
      path: 'pending/Workflow/WorkflowCardExpanded',
      hasDemo: true,
    },
    {
      name: 'PageHeader',
      component: PendingComponents.PageHeader || (() => <div>Component not found</div>),
      path: 'pending/PageHeader',
      hasDemo: true,
    },
    {
      name: 'PageHeaderDemo',
      component: PendingComponents.PageHeaderDemo || (() => <div>Component not found</div>),
      path: 'pending/PageHeaderDemo',
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
    {
      name: 'DashboardDataTableCard',
      component: RejectedComponents.DashboardDataTableCard || (() => <div>Component not found</div>),
      path: 'rejected/DashboardDataTable/DashboardDataTableCard',
      hasDemo: true,
    },
    {
      name: 'DashboardDataTableCardDemo',
      component: RejectedComponents.DashboardDataTableCardDemo || (() => <div>Component not found</div>),
      path: 'rejected/DashboardDataTable/DashboardDataTableCardDemo',
      hasDemo: true,
    },
    {
      name: 'TestPage',
      component: RejectedComponents.TestPage || (() => <div>Component not found</div>),
      path: 'rejected/DashboardDataTable/TestPage',
      hasDemo: true,
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const toggleCodeView = (componentName: string) => {
    setShowCode(prev => ({ ...prev, [componentName]: !prev[componentName] }));
  };

  const getMinimalComponentCode = (componentName: string, props: any) => {
    // Generate minimal example code based on component name and props
    const formatValue = (value: any, indent = 0): string => {
      const spaces = '  '.repeat(indent);
      
      if (typeof value === 'string') return `"${value}"`;
      if (typeof value === 'number' || typeof value === 'boolean') return String(value);
      
      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        if (value.every(v => typeof v !== 'object')) {
          return `[${value.map(v => formatValue(v)).join(', ')}]`;
        }
        return `[\n${value.map(v => `${spaces}    ${formatValue(v, indent + 2)}`).join(',\n')}\n${spaces}  ]`;
      }
      
      if (typeof value === 'object' && value !== null) {
        const entries = Object.entries(value);
        if (entries.length === 0) return '{}';
        return `{\n${entries.map(([k, v]) => `${spaces}    ${k}: ${formatValue(v, indent + 2)}`).join(',\n')}\n${spaces}  }`;
      }
      
      return 'null';
    };

    const propsEntries = Object.entries(props);
    const hasComplexProps = propsEntries.some(([_, value]) => 
      Array.isArray(value) || (typeof value === 'object' && value !== null)
    );

    let propsString = '';
    if (propsEntries.length > 0) {
      if (hasComplexProps) {
        propsString = '\n' + propsEntries.map(([key, value]) => {
          const formattedValue = formatValue(value, 1);
          return `      ${key}=${typeof value === 'string' ? formattedValue : `{${formattedValue}}`}`;
        }).join('\n') + '\n    ';
      } else {
        propsString = propsEntries.map(([key, value]) => {
          if (typeof value === 'boolean' && value) return ` ${key}`;
          const formattedValue = formatValue(value);
          return ` ${key}=${typeof value === 'string' ? formattedValue : `{${formattedValue}}`}`;
        }).join('');
      }
    }

    return `import { ${componentName} } from '@/experiment/components';

export const Example = () => {
  return <${componentName}${propsString}/>;
};`;
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
      WorkflowCardCompact: {
        id: 'wf-001',
        title: 'User Onboarding Process',
        status: 'active',
        progress: 65,
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        steps: [
          { id: '1', name: 'Account Creation', status: 'completed', assignee: { name: 'John Doe', avatar: '' } },
          { id: '2', name: 'Profile Setup', status: 'completed', assignee: { name: 'Jane Smith', avatar: '' } },
          { id: '3', name: 'Email Verification', status: 'in-progress', assignee: { name: 'John Doe', avatar: '' } },
          { id: '4', name: 'Welcome Tutorial', status: 'pending', assignee: { name: 'Mike Johnson', avatar: '' } },
        ],
      },
      WorkflowCardStandard: {
        id: 'wf-002',
        title: 'Product Launch Campaign',
        description: 'Multi-channel marketing campaign for Q4 product launch including social media, email, and content marketing.',
        status: 'active',
        progress: 45,
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        owner: { name: 'Sarah Connor', avatar: '' },
        tags: ['marketing', 'q4-2023', 'product-launch'],
        steps: [
          { id: '1', name: 'Market Research', status: 'completed', assignee: { name: 'Tom Wilson', avatar: '' }, estimatedHours: 16 },
          { id: '2', name: 'Content Creation', status: 'completed', assignee: { name: 'Alice Brown', avatar: '' }, estimatedHours: 24 },
          { id: '3', name: 'Design Assets', status: 'in-progress', assignee: { name: 'Bob Martin', avatar: '' }, estimatedHours: 32 },
          { id: '4', name: 'Social Media Setup', status: 'pending', assignee: { name: 'Carol White', avatar: '' }, estimatedHours: 8 },
          { id: '5', name: 'Email Campaign', status: 'pending', assignee: { name: 'Dave Black', avatar: '' }, estimatedHours: 16 },
        ],
      },
      WorkflowCardExpanded: {
        id: 'wf-003',
        title: 'Enterprise Software Migration',
        description: 'Complete migration of legacy systems to cloud-based infrastructure with zero downtime requirement.',
        status: 'active',
        progress: 30,
        priority: 'high',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        owner: { name: 'Michael Chen', avatar: '' },
        tags: ['infrastructure', 'migration', 'critical', 'cloud'],
        steps: [
          { 
            id: '1', 
            name: 'System Analysis', 
            description: 'Comprehensive analysis of current system architecture and dependencies',
            status: 'completed', 
            assignee: { name: 'Rachel Green', avatar: '' }, 
            estimatedHours: 40,
            actualHours: 45,
            completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            comments: 3,
            attachments: 5
          },
          { 
            id: '2', 
            name: 'Architecture Design', 
            description: 'Design new cloud architecture with scalability and security considerations',
            status: 'completed', 
            assignee: { name: 'Ross Geller', avatar: '' }, 
            estimatedHours: 60,
            actualHours: 55,
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            comments: 8,
            attachments: 12
          },
          { 
            id: '3', 
            name: 'Development Environment Setup', 
            description: 'Configure development and staging environments in cloud',
            status: 'in-progress', 
            assignee: { name: 'Monica Bing', avatar: '' }, 
            estimatedHours: 32,
            actualHours: 20,
            comments: 2,
            attachments: 3
          },
          { 
            id: '4', 
            name: 'Data Migration Strategy', 
            description: 'Plan and test data migration procedures with rollback capabilities',
            status: 'pending', 
            assignee: { name: 'Chandler Bing', avatar: '' }, 
            estimatedHours: 48,
            dependencies: ['3']
          },
          { 
            id: '5', 
            name: 'Security Implementation', 
            description: 'Implement security measures and compliance requirements',
            status: 'pending', 
            assignee: { name: 'Joey Tribbiani', avatar: '' }, 
            estimatedHours: 40,
            dependencies: ['3', '4']
          },
          { 
            id: '6', 
            name: 'Performance Testing', 
            description: 'Load testing and performance optimization',
            status: 'pending', 
            assignee: { name: 'Phoebe Buffay', avatar: '' }, 
            estimatedHours: 24,
            dependencies: ['5']
          },
        ],
        activities: [
          {
            id: 'act-1',
            type: 'comment',
            user: { name: 'Rachel Green', avatar: '' },
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            description: 'Completed system analysis. Found 3 critical dependencies that need special attention.'
          },
          {
            id: 'act-2',
            type: 'status_change',
            user: { name: 'Monica Bing', avatar: '' },
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            description: 'Started working on Development Environment Setup'
          },
          {
            id: 'act-3',
            type: 'assignment',
            user: { name: 'Michael Chen', avatar: '' },
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            description: 'Assigned Joey Tribbiani to Security Implementation'
          },
        ],
        metrics: {
          estimatedDuration: 244,
          actualDuration: 100,
          efficiency: 110,
        },
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
      PageHeader: {
        title: 'City Hall Renovation Project',
        subtitle: 'Procurement and construction management for municipal building renovation',
        user: {
          name: 'Sarah Johnson',
          role: 'Project Manager',
          department: 'Public Works',
        },
        metadata: {
          created: new Date('2024-01-15'),
          updated: new Date('2024-07-22'),
          location: '123 Main Street, Downtown',
          status: 'active',
          priority: 'high',
          tags: ['construction', 'municipal', 'q4-2024'],
        },
        variant: 'detailed',
      },
      PageHeaderDemo: {}, // This component renders its own demo
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
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Minimal Example:
              </Typography>
              <SyntaxHighlighter
                code={getMinimalComponentCode(info.name, demoProps[info.name] || {})}
                language="tsx"
                showLineNumbers={true}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Full source: <code>src/experiment/components/{info.path}.tsx</code>
              </Typography>
            </Box>
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
            <Box>
              <Typography variant="h4" color="primary">
                🎨 Component Review Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Review components for code quality, MUI compliance, TypeScript usage, and accessibility
              </Typography>
            </Box>
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
                Quick Review Guidelines
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="primary.dark">
                      📁 Pending Review
                    </Typography>
                    <Typography variant="body2" component="div">
                      • Check code quality & TypeScript types<br/>
                      • Verify MUI theme integration<br/>
                      • Test responsive design<br/>
                      • Review accessibility features<br/>
                      • Use code view (&lt;&gt; icon) to see usage examples
                    </Typography>
                  </Stack>
                </Grid>
                
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="success.dark">
                      ✅ Approve → Staging
                    </Typography>
                    <Typography variant="body2" component="div">
                      • Component meets all standards<br/>
                      • Ready for production testing<br/>
                      • Move to approved/ folder<br/>
                      • Update imports if needed<br/>
                      • Final integration review
                    </Typography>
                  </Stack>
                </Grid>
                
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="error.dark">
                      ❌ Reject → Needs Work
                    </Typography>
                    <Typography variant="body2" component="div">
                      • Add REJECTION_NOTES.md<br/>
                      • Specify required changes<br/>
                      • Move to rejected/ folder<br/>
                      • Developer can resubmit<br/>
                      • Track improvement progress
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