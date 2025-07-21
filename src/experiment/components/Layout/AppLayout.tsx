import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Container,
  Chip,
  useMediaQuery,
  useTheme,
  alpha,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Menu as MenuIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Send as SendIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { getRouteByPath, routesBySection } from '../../routes/routes.config';

export const AppLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [currentTab, setCurrentTab] = useState('');
  const [promptPanelOpen, setPromptPanelOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get current route
  const currentRoute = getRouteByPath(location.pathname);

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  // Sync currentTab with URL
  useEffect(() => {
    if (currentRoute) {
      setCurrentTab(currentRoute.id);
    }
  }, [currentRoute]);

  const handleTabChange = (tabId: string) => {
    // Find the route in any section
    for (const section of Object.keys(routesBySection)) {
      const route = routesBySection[section].find(r => r.id === tabId);
      if (route) {
        navigate(route.path);
        if (isMobile) {
          setDrawerOpen(false);
        }
        break;
      }
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Generate breadcrumbs
  const breadcrumbs = currentRoute ? [
    { label: 'Experiment', href: '/' },
    { label: currentRoute.section, href: '#' },
    { label: currentRoute.label, href: currentRoute.path },
  ] : [];

  return (
    <>
      <Navigation
        open={drawerOpen}
        isMobile={isMobile}
        currentTab={currentTab}
        onClose={() => setDrawerOpen(false)}
        onTabChange={handleTabChange}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: drawerOpen ? '280px' : 0 },
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <AppBar
          position="sticky"
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box sx={{ flexGrow: 1 }}>
              {currentRoute && (
                <>
                  <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    sx={{ mb: 0.5 }}
                  >
                    {breadcrumbs.map((crumb, index) => (
                      <Link
                        key={index}
                        color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
                        href={crumb.href}
                        underline="hover"
                        onClick={(e) => {
                          if (crumb.href === '#') {
                            e.preventDefault();
                          }
                        }}
                        sx={{ fontSize: '0.875rem' }}
                      >
                        {crumb.label}
                      </Link>
                    ))}
                  </Breadcrumbs>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h6" component="h1">
                      {currentRoute.label}
                    </Typography>
                    {currentRoute.isRejected && (
                      <Chip
                        label="Rejected"
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    )}
                    {currentRoute.isPending && (
                      <Chip
                        label="Pending"
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  {currentRoute.description && (
                    <Typography variant="caption" color="text.secondary">
                      {currentRoute.description}
                    </Typography>
                  )}
                </>
              )}
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                icon={<CheckCircleIcon />}
                label="Ready"
                color="success"
                size="small"
                variant="outlined"
              />
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>

      {/* AI Prompt Panel FAB */}
      <Fab
        color="primary"
        aria-label="AI Assistant"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: theme.zIndex.speedDial,
        }}
        onClick={() => setPromptPanelOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* AI Prompt Dialog */}
      <Dialog
        open={promptPanelOpen}
        onClose={() => setPromptPanelOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          AI Assistant
          <IconButton
            aria-label="close"
            onClick={() => setPromptPanelOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Enter your command"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromptPanelOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<SendIcon />}>
            Execute
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};