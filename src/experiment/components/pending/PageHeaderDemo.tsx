import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  AccountBalance as AccountBalanceIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  MoreVert as MoreVertIcon,
  Notifications as NotificationsIcon,
  DataObject as DataObjectIcon,
} from '@mui/icons-material';
import PageHeader, { PageHeaderProps } from './PageHeader';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const PageHeaderDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'compact' | 'detailed'>('default');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleVariantChange = (variant: 'default' | 'compact' | 'detailed') => {
    setSelectedVariant(variant);
  };

  const handleAction = (action: string) => {
    console.log(`Action clicked: ${action}`);
    // In a real app, this would trigger the actual action
  };

  // Example data based on schema structure
  const procurementProjectHeader: PageHeaderProps = {
    title: 'City Hall Renovation Project',
    subtitle: 'Procurement and construction management for municipal building renovation',
    breadcrumbs: [
      { label: 'Procurement', icon: <BusinessIcon /> },
      { label: 'Projects', icon: <AssignmentIcon /> },
      { label: 'Active Projects' },
    ],
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
      priority: 'high' as const,
      tags: ['construction', 'municipal', 'q4-2024'],
    },
    actions: [
      {
        label: 'Edit Project',
        icon: <EditIcon />,
        onClick: () => handleAction('edit'),
        tooltip: 'Edit project details',
      },
      {
        label: 'Share',
        icon: <ShareIcon />,
        onClick: () => handleAction('share'),
        tooltip: 'Share project information',
      },
      {
        label: 'Bookmark',
        icon: <BookmarkIcon />,
        onClick: () => handleAction('bookmark'),
        tooltip: 'Bookmark this project',
      },
      {
        label: 'More Options',
        icon: <MoreVertIcon />,
        onClick: () => handleAction('more'),
        tooltip: 'Additional options',
      },
    ],
    variant: selectedVariant,
  };

  const budgetHeader: PageHeaderProps = {
    title: 'FY 2024 Budget Overview',
    subtitle: 'Comprehensive budget planning and tracking for fiscal year 2024',
    breadcrumbs: [
      { label: 'Budgeting', icon: <AccountBalanceIcon /> },
      { label: 'Fiscal Year 2024' },
    ],
    user: {
      name: 'Michael Chen',
      role: 'Budget Director',
      department: 'Finance',
    },
    metadata: {
      created: new Date('2023-12-01'),
      updated: new Date('2024-07-20'),
      status: 'approved',
      priority: 'medium' as const,
      tags: ['budget', 'fiscal-year', 'approved'],
    },
    actions: [
      {
        label: 'Export Report',
        icon: <ShareIcon />,
        onClick: () => handleAction('export'),
        tooltip: 'Export budget report',
      },
      {
        label: 'Notifications',
        icon: <NotificationsIcon />,
        onClick: () => handleAction('notifications'),
        tooltip: 'Manage notifications',
      },
    ],
    variant: selectedVariant,
  };

  const permitHeader: PageHeaderProps = {
    title: 'Building Permit #BP-2024-001',
    subtitle: 'Commercial building permit for new office complex',
    breadcrumbs: [
      { label: 'Permitting', icon: <AssignmentIcon /> },
      { label: 'Building Permits' },
    ],
    user: {
      name: 'David Rodriguez',
      role: 'Inspector',
      department: 'Building & Safety',
    },
    metadata: {
      created: new Date('2024-06-15'),
      updated: new Date('2024-07-21'),
      location: '456 Business Ave, Industrial District',
      status: 'in-progress',
      priority: 'high' as const,
      tags: ['commercial', 'new-construction', 'inspection-required'],
    },
    actions: [
      {
        label: 'Schedule Inspection',
        icon: <EditIcon />,
        onClick: () => handleAction('schedule'),
        tooltip: 'Schedule building inspection',
      },
      {
        label: 'View Documents',
        icon: <ShareIcon />,
        onClick: () => handleAction('documents'),
        tooltip: 'View permit documents',
      },
    ],
    variant: selectedVariant,
  };

  const utilityHeader: PageHeaderProps = {
    title: 'Utility Account #UA-789012',
    subtitle: 'Water and electricity services for residential property',
    breadcrumbs: [
      { label: 'Utility Billing', icon: <BusinessIcon /> },
      { label: 'Accounts' },
    ],
    user: {
      name: 'Lisa Thompson',
      role: 'Customer Service',
      department: 'Utilities',
    },
    metadata: {
      created: new Date('2023-03-10'),
      updated: new Date('2024-07-22'),
      location: '789 Residential Lane, Suburbs',
      status: 'active',
      priority: 'low' as const,
      tags: ['residential', 'water', 'electricity'],
    },
    actions: [
      {
        label: 'Payment History',
        icon: <ShareIcon />,
        onClick: () => handleAction('history'),
        tooltip: 'View payment history',
      },
      {
        label: 'Report Issue',
        icon: <EditIcon />,
        onClick: () => handleAction('report'),
        tooltip: 'Report service issue',
      },
    ],
    variant: selectedVariant,
  };

  const taxHeader: PageHeaderProps = {
    title: 'Property Tax Assessment',
    subtitle: 'Annual property tax assessment for commercial property',
    breadcrumbs: [
      { label: 'Tax & Revenue', icon: <AccountBalanceIcon /> },
      { label: 'Property Tax' },
    ],
    user: {
      name: 'Robert Wilson',
      role: 'Assessor',
      department: 'Tax Assessment',
    },
    metadata: {
      created: new Date('2024-01-01'),
      updated: new Date('2024-07-15'),
      location: '321 Commercial Blvd, Business District',
      status: 'pending',
      priority: 'medium' as const,
      tags: ['commercial', 'property-tax', 'assessment'],
    },
    actions: [
      {
        label: 'Review Assessment',
        icon: <EditIcon />,
        onClick: () => handleAction('review'),
        tooltip: 'Review tax assessment',
      },
      {
        label: 'Generate Bill',
        icon: <ShareIcon />,
        onClick: () => handleAction('generate'),
        tooltip: 'Generate tax bill',
      },
    ],
    variant: selectedVariant,
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        PageHeader Component Demo
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        This demo showcases the PageHeader component with different variants and use cases based on the OpenGov schema structure.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Schema Integration:</strong> The PageHeader component is designed to work with the OpenGov database schema, 
        supporting users, departments, locations, statuses, priorities, and various metadata fields.
      </Alert>

      {/* Variant Switcher */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Variant Switcher
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Switch between different PageHeader variants to see how they adapt to different use cases.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant={selectedVariant === 'default' ? 'contained' : 'outlined'}
              onClick={() => handleVariantChange('default')}
              startIcon={<DataObjectIcon />}
            >
              Default
            </Button>
            <Button
              variant={selectedVariant === 'compact' ? 'contained' : 'outlined'}
              onClick={() => handleVariantChange('compact')}
              startIcon={<DataObjectIcon />}
            >
              Compact
            </Button>
            <Button
              variant={selectedVariant === 'detailed' ? 'contained' : 'outlined'}
              onClick={() => handleVariantChange('detailed')}
              startIcon={<DataObjectIcon />}
            >
              Detailed
            </Button>
          </Stack>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Current Variant:</strong> {selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)}
              {selectedVariant === 'default' && ' - Standard layout with balanced information density'}
              {selectedVariant === 'compact' && ' - Streamlined layout for space-constrained interfaces'}
              {selectedVariant === 'detailed' && ' - Comprehensive layout with rich metadata and actions'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Procurement Project" />
            <Tab label="Budget Overview" />
            <Tab label="Building Permit" />
            <Tab label="Utility Account" />
            <Tab label="Tax Assessment" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" gutterBottom>
              {selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)} Variant - Procurement Project
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Shows a {selectedVariant} header with user info, metadata, and multiple actions for project management.
            </Typography>
            <PageHeader {...procurementProjectHeader} />
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Features demonstrated:</strong> Detailed variant, user information, rich metadata, 
                multiple action buttons, breadcrumbs, status and priority chips, tags.
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom>
              {selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)} Variant - Budget Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)} header layout for budget management with essential information and actions.
            </Typography>
            <PageHeader {...budgetHeader} />
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Features demonstrated:</strong> Default variant, budget-specific metadata, 
                approved status, fiscal year tags, export and notification actions.
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>
              {selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)} Variant - Building Permit
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)} header for permit management with essential information.
            </Typography>
            <PageHeader {...permitHeader} />
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Features demonstrated:</strong> Compact variant, permit-specific metadata, 
                inspection workflow actions, location information, in-progress status.
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>
              {selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)} Variant - Utility Account
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)} header for utility account management.
            </Typography>
            <PageHeader {...utilityHeader} />
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Features demonstrated:</strong> Utility account metadata, customer service actions, 
                residential property information, active service status.
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Typography variant="h6" gutterBottom>
              {selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)} Variant - Tax Assessment
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)} header for tax assessment workflow with assessor information.
            </Typography>
            <PageHeader {...taxHeader} />
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Features demonstrated:</strong> Tax assessment workflow, assessor information, 
                pending status, commercial property metadata, assessment-specific actions.
              </Typography>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Component Features
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Variants
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip label="Default" variant="outlined" />
                <Chip label="Compact" variant="outlined" />
                <Chip label="Detailed" variant="outlined" />
              </Stack>
            </Box>
            
            <Divider />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Schema Integration
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label="Users" size="small" />
                <Chip label="Departments" size="small" />
                <Chip label="Locations" size="small" />
                <Chip label="Status" size="small" />
                <Chip label="Priority" size="small" />
                <Chip label="Tags" size="small" />
                <Chip label="Timestamps" size="small" />
                <Chip label="Actions" size="small" />
              </Stack>
            </Box>
            
            <Divider />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Use Cases
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label="Procurement" size="small" />
                <Chip label="Budgeting" size="small" />
                <Chip label="Permitting" size="small" />
                <Chip label="Utility Billing" size="small" />
                <Chip label="Tax & Revenue" size="small" />
                <Chip label="Asset Management" size="small" />
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PageHeaderDemo; 