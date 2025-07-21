import React from 'react';
import { Box, Alert, Typography } from '@mui/material';

interface SimpleDynamicRendererProps {
  code: string;
  props: Record<string, any>;
}

export const SimpleDynamicRenderer: React.FC<SimpleDynamicRendererProps> = ({ code, props }) => {
  // For now, just show the code and props
  // This avoids the evaluation errors while we debug
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Component Preview (Code Display Mode)
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Dynamic rendering is being debugged. Showing code instead.
        </Typography>
      </Alert>
      
      <Box sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: 1, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Props:</Typography>
        <pre style={{ margin: 0, fontSize: '0.875rem' }}>
          {JSON.stringify(props, null, 2)}
        </pre>
      </Box>
      
      <Box sx={{ p: 2, backgroundColor: 'grey.900', color: 'grey.100', borderRadius: 1, overflow: 'auto' }}>
        <Typography variant="subtitle2" gutterBottom>Component Code:</Typography>
        <pre style={{ margin: 0, fontSize: '0.875rem' }}>
          {code}
        </pre>
      </Box>
    </Box>
  );
};