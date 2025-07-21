import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

/**
 * @component TailwindTest
 * @category Testing
 * @description Test component to verify Tailwind CSS integration with MUI
 */
export const TailwindTest = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tailwind + MUI Integration Test
      </Typography>
      
      {/* Using Tailwind classes */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Tailwind utility classes */}
        <div className="p-4 bg-gray-100 rounded-lg shadow-soft">
          <h3 className="text-lg font-semibold mb-2">Tailwind Utilities</h3>
          <p className="text-gray-600">This uses Tailwind's utility classes</p>
          <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Tailwind Button
          </button>
        </div>
        
        {/* Custom Tailwind components */}
        <div className="tw-card p-4">
          <h3 className="text-h6 font-semibold mb-2 tw-text-primary">Custom Components</h3>
          <p className="tw-text-secondary">This uses custom Tailwind components with MUI variables</p>
          <button className="tw-btn-primary mt-2">
            Custom Primary Button
          </button>
          <button className="tw-btn-secondary mt-2 ml-2">
            Custom Secondary Button
          </button>
        </div>
      </Box>
      
      {/* MUI Components with Tailwind classes */}
      <Box className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="tw-gradient-primary text-white">
          <CardContent>
            <Typography variant="h6" color="inherit">
              Gradient Card
            </Typography>
            <Typography variant="body2" color="inherit" className="mt-2 opacity-90">
              MUI Card with Tailwind gradient utility
            </Typography>
          </CardContent>
        </Card>
        
        <Card className="shadow-medium hover:shadow-strong transition-shadow">
          <CardContent>
            <Typography variant="h6">
              Shadow Effects
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-2">
              Custom shadow utilities with hover effect
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-3">
              MUI Components
            </Typography>
            <Button variant="contained" color="primary" fullWidth>
              MUI Button
            </Button>
            <Button variant="outlined" color="secondary" fullWidth className="mt-2">
              MUI Outlined
            </Button>
          </CardContent>
        </Card>
      </Box>
      
      {/* Responsive spacing with Tailwind */}
      <Box className="mt-4 md:mt-8 p-2 md:p-4 bg-gray-50 rounded-lg">
        <Typography variant="body2" className="text-center">
          Responsive spacing: smaller on mobile, larger on desktop
        </Typography>
      </Box>
    </Box>
  );
};