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
} from '@mui/material';
import {
  Menu as MenuIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { SSEConnection } from '../Features/Connection/SSEConnection';
import { ContextManager } from '../Features/Context/ContextManager';
import { ThemeEditor } from '../Features/ThemeEditor/ThemeEditor';
import { AIIntegration } from '../Features/AI/AIIntegration';
import { GitHubIntegration } from '../Features/GitHub/GitHubIntegration';
import { Performance } from '../Features/Performance/Performance';
import { ComponentGenerator } from '../Features/ComponentGenerator/ComponentGenerator';
import { PatternCatalog } from '../Features/PatternCatalog/PatternCatalog';
import { DBMLEditor } from '../Features/DBMLEditor/DBMLEditor';
import { BudgetingDashboard } from '../rejected/Budgeting/BudgetingDashboard';
import { BudgetCategoryCardPreview } from '../approved/BudgetCategoryCardPreview';
import { TailwindTest } from '../Features/TailwindTest';

export const AppLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [currentTab, setCurrentTab] = useState('connection');
  const [promptPanelOpen, setPromptPanelOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  // Sync currentTab with URL
  useEffect(() => {
    const path = location.pathname.replace(/^\//, '') || 'connection';
    setCurrentTab(path);
    
    // If we're at the root, navigate to dbml-editor
    if (location.pathname === '/' || location.pathname === '') {
      navigate('/dbml-editor');
    }
  }, [location.pathname, navigate]);

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    navigate(`/${tabId}`);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'connection':
        return <SSEConnection />;
      case 'context':
        return <ContextManager />;
      case 'ai':
        return <AIIntegration />;
      case 'github':
        return <GitHubIntegration />;
      case 'performance':
        return <Performance />;
      case 'theme-editor':
        return <ThemeEditor />;
      case 'component-generator':
        return <ComponentGenerator />;
      case 'pattern-generator':
        return <ComponentGenerator />; // Backwards compatibility
      case 'pattern-catalog':
        return <PatternCatalog />;
      case 'dbml-editor':
        return <DBMLEditor />;
      case 'budgeting':
        return <BudgetingDashboard />;
      case 'budget-category-preview':
        return <BudgetCategoryCardPreview />;
      case 'tailwind-test':
        return <TailwindTest />;
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {currentTab.charAt(0).toUpperCase() + currentTab.slice(1).replace('-', ' ')}
            </Typography>
            <Typography color="text.secondary">
              This feature is under development. Check back soon!
            </Typography>
          </Box>
        );
    }
  };

  const drawerWidth = drawerOpen ? 280 : 0;

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Momentum Experimentation Lab
          </Typography>
          <Chip
            icon={<CheckCircleIcon />}
            label="System Active"
            color="success"
            sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), color: 'white' }}
          />
        </Toolbar>
      </AppBar>

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
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Container maxWidth="xl">
          {renderTabContent()}
        </Container>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setPromptPanelOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Prompt Panel Dialog */}
      <Dialog
        open={promptPanelOpen}
        onClose={() => setPromptPanelOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Quick Action
          <IconButton
            aria-label="close"
            onClick={() => setPromptPanelOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
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