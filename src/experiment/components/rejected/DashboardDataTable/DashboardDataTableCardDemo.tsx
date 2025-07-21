import React, { useState } from 'react';
import { Box, Typography, Chip, Avatar, Button } from '@mui/material';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';
import DashboardDataTableCard from './DashboardDataTableCard';

// Sample data for demonstration
const sampleData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-15',
    department: 'Engineering',
    performance: 95,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Manager',
    status: 'Active',
    lastLogin: '2024-01-14',
    department: 'Marketing',
    performance: 88,
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'Developer',
    status: 'Inactive',
    lastLogin: '2024-01-10',
    department: 'Engineering',
    performance: 92,
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: 'Designer',
    status: 'Active',
    lastLogin: '2024-01-16',
    department: 'Design',
    performance: 87,
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    role: 'Developer',
    status: 'Active',
    lastLogin: '2024-01-13',
    department: 'Engineering',
    performance: 91,
  },
  {
    id: 6,
    name: 'Diana Davis',
    email: 'diana.davis@example.com',
    role: 'Manager',
    status: 'Active',
    lastLogin: '2024-01-12',
    department: 'Sales',
    performance: 89,
  },
  {
    id: 7,
    name: 'Eve Miller',
    email: 'eve.miller@example.com',
    role: 'Analyst',
    status: 'Inactive',
    lastLogin: '2024-01-08',
    department: 'Analytics',
    performance: 94,
  },
  {
    id: 8,
    name: 'Frank Garcia',
    email: 'frank.garcia@example.com',
    role: 'Developer',
    status: 'Active',
    lastLogin: '2024-01-15',
    department: 'Engineering',
    performance: 90,
  },
];

const DashboardDataTableCardDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Column definitions
  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      sortable: true,
      render: (value: string, row: any) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
            {value.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      sortable: true,
      render: (value: string) => (
        <Chip
          label={value}
          size="small"
          color={value === 'Admin' ? 'error' : value === 'Manager' ? 'warning' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      sortable: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      render: (value: string) => (
        <Chip
          label={value}
          size="small"
          color={value === 'Active' ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'performance',
      headerName: 'Performance',
      sortable: true,
      render: (value: number) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" fontWeight="medium">
            {value}%
          </Typography>
          {value >= 90 ? (
            <TrendingUpIcon color="success" fontSize="small" />
          ) : (
            <TrendingDownIcon color="warning" fontSize="small" />
          )}
        </Box>
      ),
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      sortable: true,
      render: (value: string) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(value).toLocaleDateString()}
        </Typography>
      ),
    },
  ];

  const handleRowClick = (row: any) => {
    console.log('Row clicked:', row);
  };

  const handleEdit = (row: any) => {
    console.log('Edit row:', row);
  };

  const handleDelete = (row: any) => {
    console.log('Delete row:', row);
  };

  const handleAdd = () => {
    console.log('Add new record');
  };

  const handleExport = () => {
    console.log('Export data');
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleError = () => {
    setError('Failed to load data. Please try again.');
    setTimeout(() => {
      setError(undefined);
    }, 3000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Data Table Card Demo
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        A comprehensive data table component wrapped in a card for dashboard use.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Basic Usage */}
        <Box sx={{ width: '100%' }}>
          <DashboardDataTableCard
            title="User Management"
            subtitle="Manage user accounts and permissions"
            data={sampleData}
            columns={columns}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
            onExport={handleExport}
            onRefresh={handleRefresh}
          />
        </Box>

        {/* Compact Version */}
        <Box sx={{ width: '100%' }}>
          <DashboardDataTableCard
            title="Recent Activity"
            subtitle="Latest user activities"
            data={sampleData.slice(0, 4)}
            columns={columns.slice(0, 4)} // Fewer columns for compact view
            showSearch={false}
            showFilters={false}
            showPagination={false}
            rowsPerPage={5}
            onRowClick={handleRowClick}
          />
        </Box>

        {/* Loading State */}
        <Box sx={{ width: '100%' }}>
          <DashboardDataTableCard
            title="Loading Example"
            subtitle="Shows loading state"
            data={sampleData}
            columns={columns}
            loading={loading}
            onRefresh={handleRefresh}
          />
        </Box>

        {/* Error State */}
        <Box sx={{ width: '100%' }}>
          <DashboardDataTableCard
            title="Error Example"
            subtitle="Shows error handling"
            data={sampleData}
            columns={columns}
            error={error}
            onRefresh={handleRefresh}
          />
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={handleError}>
              Simulate Error
            </Button>
          </Box>
        </Box>

        {/* Minimal Version */}
        <Box sx={{ width: '100%' }}>
          <DashboardDataTableCard
            title="Minimal Data Table"
            subtitle="Basic table without extra features"
            data={sampleData}
            columns={columns.slice(0, 3)}
            showSearch={false}
            showFilters={false}
            showActions={false}
            showPagination={false}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardDataTableCardDemo; 