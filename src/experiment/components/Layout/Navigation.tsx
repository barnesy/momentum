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
  Divider,
  ListSubheader,
} from '@mui/material';
import { routesBySection } from '../../routes/routes.config';

interface NavigationProps {
  open: boolean;
  isMobile: boolean;
  currentTab: string;
  onClose?: () => void;
  onTabChange: (tabId: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  open,
  isMobile,
  currentTab,
  onClose,
  onTabChange,
}) => {
  const drawer = (
    <Box sx={{ overflow: 'auto' }}>
      <Toolbar sx={{ px: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Momentum
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Experimentation Lab
          </Typography>
        </Box>
      </Toolbar>
      
      <Divider />
      
      <List>
        {Object.entries(routesBySection).map(([section, routes]) => (
          <React.Fragment key={section}>
            <ListSubheader
              sx={{
                backgroundColor: 'transparent',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                color: 'text.secondary',
                mt: 1,
              }}
            >
              {section}
            </ListSubheader>
            
            {routes.map((route) => (
              <ListItem key={route.id} disablePadding sx={{ px: 1 }}>
                <ListItemButton
                  selected={currentTab === route.id}
                  onClick={() => onTabChange(route.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                      '&:hover': {
                        backgroundColor: 'action.selected',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {route.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={route.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: currentTab === route.id ? 600 : 400,
                    }}
                  />
                  {route.isPending && (
                    <Chip
                      label="Pending"
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                  {route.isRejected && (
                    <Chip
                      label="Rejected"
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};