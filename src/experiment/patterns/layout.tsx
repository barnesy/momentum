import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Breadcrumbs,
  Link,
  Paper,
  Container,
  Divider,
  IconButton,
  Toolbar,
  AppBar,
  CircularProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

/**
 * @component HeaderWithActions
 * @category Layout
 * @description Page header with title, subtitle, breadcrumbs, and action buttons
 */
export const HeaderWithActions = ({ title, subtitle, breadcrumbs, actions }) => {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs && (
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" href="/">
            <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Home
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
              href={crumb.href}
              underline={crumb.href ? 'hover' : 'none'}
              sx={{ cursor: crumb.href ? 'pointer' : 'default' }}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {actions && (
          <Stack direction="row" spacing={2}>
            {actions}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

/**
 * @component HeaderSimple
 * @category Layout
 * @description Simple page header with just title and optional back button
 */
export const HeaderSimple = ({ title, onBack }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Box display="flex" alignItems="center" gap={1}>
        {onBack && (
          <IconButton onClick={onBack} edge="start">
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h5" component="h1">
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * @component PageContainer
 * @category Layout
 * @description Consistent page container with proper spacing
 */
export const PageContainer = ({ children, maxWidth = 'lg' }) => {
  return (
    <Container maxWidth={maxWidth} sx={{ py: 3 }}>
      {children}
    </Container>
  );
};

/**
 * @component SectionDivider
 * @category Layout
 * @description Section divider with optional title
 */
export const SectionDivider = ({ title }) => {
  return (
    <Box sx={{ my: 4 }}>
      {title ? (
        <Box display="flex" alignItems="center" gap={2}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>
      ) : (
        <Divider />
      )}
    </Box>
  );
};

/**
 * @component TwoColumnLayout
 * @category Layout
 * @description Responsive two-column layout
 */
export const TwoColumnLayout = ({ left, right, leftWidth = 4, gap = 3 }) => {
  const rightWidth = 12 - leftWidth;
  
  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: `${leftWidth}fr ${rightWidth}fr` }} gap={gap}>
      <Box>{left}</Box>
      <Box>{right}</Box>
    </Box>
  );
};

/**
 * @component SidebarLayout
 * @category Layout
 * @description Layout with fixed sidebar and scrollable content
 */
export const SidebarLayout = ({ sidebar, children, sidebarWidth = 280 }) => {
  return (
    <Box display="flex" height="100vh">
      <Paper 
        elevation={0} 
        sx={{ 
          width: sidebarWidth, 
          borderRight: 1, 
          borderColor: 'divider',
          overflow: 'auto'
        }}
      >
        {sidebar}
      </Paper>
      <Box flex={1} overflow="auto">
        {children}
      </Box>
    </Box>
  );
};

/**
 * @component AppHeader
 * @category Layout
 * @description Application header with navigation
 */
export const AppHeader = ({ title, menuItems, onMenuClick, actions }) => {
  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar>
        {onMenuClick && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        
        {menuItems && (
          <Stack direction="row" spacing={2} sx={{ mr: 2 }}>
            {menuItems.map((item, index) => (
              <Button key={index} color="inherit" href={item.href}>
                {item.label}
              </Button>
            ))}
          </Stack>
        )}
        
        {actions && (
          <Stack direction="row" spacing={1}>
            {actions}
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

/**
 * @component CardGrid
 * @category Layout
 * @description Responsive grid for cards
 */
export const CardGrid = ({ children, columns = { xs: 1, sm: 2, md: 3, lg: 4 }, spacing = 3 }) => {
  return (
    <Box 
      display="grid" 
      gridTemplateColumns={{
        xs: `repeat(${columns.xs}, 1fr)`,
        sm: `repeat(${columns.sm}, 1fr)`,
        md: `repeat(${columns.md}, 1fr)`,
        lg: `repeat(${columns.lg}, 1fr)`,
      }}
      gap={spacing}
    >
      {children}
    </Box>
  );
};

/**
 * @component EmptyState
 * @category Layout
 * @description Empty state with icon, message, and optional action
 */
export const EmptyState = ({ icon, title, message, action }) => {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      py={8}
      px={3}
      textAlign="center"
    >
      {icon && (
        <Box color="text.disabled" sx={{ mb: 2, '& > svg': { fontSize: 64 } }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
          {message}
        </Typography>
      )}
      {action}
    </Box>
  );
};

/**
 * @component LoadingState
 * @category Layout
 * @description Centered loading indicator with optional message
 */
export const LoadingState = ({ message }) => {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      py={8}
    >
      <CircularProgress sx={{ mb: 2 }} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};