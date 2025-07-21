import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { AppLayout } from '../components/Layout/AppLayout';
import { routes, DEFAULT_ROUTE } from './routes.config';
import { ErrorBoundary } from '../components/Common/ErrorBoundary';
import { NotFound } from '../components/Common/NotFound';

// Loading component for lazy loaded routes
const RouteLoader: React.FC = () => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="400px"
    gap={2}
  >
    <CircularProgress />
    <Typography variant="body2" color="text.secondary">
      Loading...
    </Typography>
  </Box>
);

// Route wrapper with error boundary
const RouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<RouteLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={DEFAULT_ROUTE} replace />} />
      
      {/* Layout wrapper for all routes */}
      <Route element={<AppLayout />}>
        {/* Dynamic routes from config */}
        {routes.map((route) => (
          <Route
            key={route.id}
            path={route.path}
            element={
              <RouteWrapper>
                <route.component />
              </RouteWrapper>
            }
          />
        ))}
        
        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};