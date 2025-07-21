import React from 'react';
import { Box, Typography } from '@mui/material';
import DashboardDataTableCardDemo from './DashboardDataTableCardDemo';

const DashboardDataTableCardTest: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom>
        Dashboard Data Table Card Test
      </Typography>
      <DashboardDataTableCardDemo />
    </Box>
  );
};

export default DashboardDataTableCardTest; 