import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import DashboardDataTableCard from './DashboardDataTableCard';

const TestPage: React.FC = () => {
  const sampleData = [
    { id: 1, name: 'John Doe', role: 'Admin', status: 'Active', department: 'Engineering' },
    { id: 2, name: 'Jane Smith', role: 'Manager', status: 'Active', department: 'Marketing' },
  ];

  const columns = [
    { field: 'name', headerName: 'Name', sortable: true },
    { field: 'role', headerName: 'Role', sortable: true },
    { field: 'department', headerName: 'Department', sortable: true },
    { field: 'status', headerName: 'Status', sortable: true },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard DataTable Card Test
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Testing the DashboardDataTableCard component
      </Typography>
      
      <DashboardDataTableCard
        title="Test Data Table"
        subtitle="Testing the component"
        data={sampleData}
        columns={columns}
        onRowClick={(row) => console.log('Row clicked:', row)}
      />
    </Box>
  );
};

export default TestPage; 