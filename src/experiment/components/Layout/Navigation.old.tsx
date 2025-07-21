import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Toolbar,
  Chip,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Dashboard as DashboardIcon,
  GitHub as GitHubIcon,
  Psychology as PsychologyIcon,
  BubbleChart as BubbleChartIcon,
  AccountTree as AccountTreeIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  BugReport as BugReportIcon,
  Widgets as WidgetsIcon,
  Palette as PaletteIcon,
  Texture as TextureIcon,
  CollectionsBookmark as CollectionsBookmarkIcon,
  DataObject as DataObjectIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  section: string;
  isPending?: boolean;
  isRejected?: boolean;
}

interface NavigationProps {
  open: boolean;
  isMobile: boolean;
  currentTab: string;
  onClose?: () => void;
  onTabChange: (tabId: string) => void;
}

const navigationItems: NavigationItem[] = [
  { id: 'connection', label: 'Connection', icon: <StorageIcon />, section: 'Core Features' },
  { id: 'context', label: 'Context', icon: <DashboardIcon />, section: 'Core Features' },
  { id: 'github', label: 'GitHub', icon: <GitHubIcon />, section: 'Core Features' },
  { id: 'ai', label: 'AI Integration', icon: <PsychologyIcon />, section: 'Core Features' },
  { id: 'network', label: 'Network Viz', icon: <BubbleChartIcon />, section: 'Visualizations' },
  { id: 'github-network', label: 'GitHub Network', icon: <AccountTreeIcon />, section: 'Visualizations' },
  { id: 'decisions', label: 'Decision Tracking', icon: <TimelineIcon />, section: 'Visualizations' },
  { id: 'diagnostics', label: 'Diagnostics', icon: <AnalyticsIcon />, section: 'Monitoring & Testing' },
  { id: 'smart-errors', label: 'Smart Errors', icon: <ErrorIcon />, section: 'Monitoring & Testing' },
  { id: 'performance', label: 'Performance', icon: <SpeedIcon />, section: 'Monitoring & Testing' },
  { id: 'errors', label: 'Error Testing', icon: <BugReportIcon />, section: 'Monitoring & Testing' },
  { id: 'mui', label: 'MUI Detection', icon: <WidgetsIcon />, section: 'Monitoring & Testing' },
  { id: 'theme-editor', label: 'Theme Editor', icon: <PaletteIcon />, section: 'Customization' },
  { id: 'component-generator', label: 'Component Generator', icon: <TextureIcon />, section: 'Customization' },
  { id: 'pattern-catalog', label: 'Pattern Catalog', icon: <CollectionsBookmarkIcon />, section: 'Customization' },
  { id: 'dbml-editor', label: 'DBML Schema Editor', icon: <DataObjectIcon />, section: 'Customization' },
  { id: 'budgeting', label: 'Budgeting Dashboard', icon: <AccountBalanceIcon />, section: 'Demonstrations', isRejected: true },
  { id: 'budget-category-preview', label: 'BudgetCategoryCard Preview', icon: <AccountBalanceIcon />, section: 'Demonstrations' },
  { id: 'tailwind-test', label: 'Tailwind CSS Test', icon: <PaletteIcon />, section: 'Demonstrations' },
];

export const Navigation: React.FC<NavigationProps> = ({
  open,
  isMobile,
  currentTab,
  onClose,
  onTabChange,
}) => {
  const drawerWidth = 280;
  
  const sections = ['Core Features', 'Visualizations', 'Monitoring & Testing', 'Customization', 'Demonstrations'];

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={onClose}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {sections.map((section) => (
            <React.Fragment key={section}>
              <ListItem>
                <Typography variant="overline" color="text.secondary">
                  {section}
                </Typography>
              </ListItem>
              {navigationItems
                .filter(item => item.section === section)
                .map((item) => (
                  <ListItem key={item.id} disablePadding>
                    <ListItemButton
                      selected={currentTab === item.id}
                      onClick={() => onTabChange(item.id)}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            {item.label}
                            {item.isPending && (
                              <Chip 
                                label="Pending Review" 
                                size="small" 
                                color="warning" 
                              />
                            )}
                            {item.isRejected && (
                              <Chip 
                                label="Rejected" 
                                size="small" 
                                color="error" 
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};