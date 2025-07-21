// Test component for the Component Generator
// This shows what a generated component should look like

import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';

export const TestComponent = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Test Component
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This is a test component to verify the dynamic renderer works correctly.
        </Typography>
        <Box mt={2}>
          <Button variant="contained" color="primary">
            Test Button
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};