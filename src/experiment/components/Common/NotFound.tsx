import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="60vh"
      textAlign="center"
      p={3}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '4rem', md: '6rem' },
          fontWeight: 'bold',
          color: 'text.secondary',
          mb: 2,
        }}
      >
        404
      </Typography>
      
      <Typography variant="h4" gutterBottom>
        Page Not Found
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500 }}>
        The page you're looking for doesn't exist or has been moved. Please check the URL or navigate back to a valid page.
      </Typography>
      
      <Stack direction="row" spacing={2} mt={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
        >
          Go Home
        </Button>
      </Stack>
    </Box>
  );
};