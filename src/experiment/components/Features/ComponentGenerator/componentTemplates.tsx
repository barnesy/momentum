import React from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  Stack,
  Card,
  CardContent,
  IconButton,
  Breadcrumbs,
  Link,
  Badge,
  LinearProgress,
  Grid,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { ComponentSpec } from './promptParser';

export interface ComponentTemplate {
  name: string;
  matches: (spec: ComponentSpec) => boolean;
  generate: (spec: ComponentSpec) => {
    name: string;
    description: string;
    component: React.FC<any>;
    code: string;
    defaultProps: Record<string, any>;
    variations: Array<{
      id: string;
      name: string;
      props: Record<string, any>;
      description: string;
    }>;
  };
}

// Page Header Component Template
const PageHeaderTemplate: ComponentTemplate = {
  name: 'Page Header',
  matches: (spec) => spec.type === 'header',
  generate: (spec) => {
    const PageHeaderComponent: React.FC<any> = (props) => (
      <Box sx={{ mb: 4 }}>
        {props.breadcrumbs && (
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link underline="hover" color="inherit" href="#">
              <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
              Home
            </Link>
            {props.breadcrumbs.map((crumb: string, index: number) => (
              <Link
                key={index}
                underline="hover"
                color={index === props.breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
                href="#"
              >
                {crumb}
              </Link>
            ))}
          </Breadcrumbs>
        )}
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {props.title}
            </Typography>
            {props.subtitle && (
              <Typography variant="body1" color="text.secondary">
                {props.subtitle}
              </Typography>
            )}
          </Box>
          
          {props.actions && (
            <Stack direction="row" spacing={2}>
              {props.actions.map((action: any, index: number) => (
                <Button
                  key={index}
                  variant={action.variant || (index === 0 ? 'contained' : 'outlined')}
                  startIcon={action.icon}
                  size={props.size || 'medium'}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          )}
        </Box>
        
        {props.stats && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {props.stats.map((stat: any, index: number) => (
              <Grid size={{ xs: 6, sm: 3 }} key={index}>
                <Box>
                  <Typography variant="h4" color={stat.trend === 'up' ? 'success.main' : stat.trend === 'down' ? 'error.main' : 'text.primary'}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );

    const code = `import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link, Stack, Grid } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

export const PageHeader = ({ title, subtitle, breadcrumbs, actions, stats }) => (
  <Box sx={{ mb: 4 }}>
    {breadcrumbs && (
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="#">
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Home
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <Link
            key={index}
            underline="hover"
            color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
            href="#"
          >
            {crumb}
          </Link>
        ))}
      </Breadcrumbs>
    )}
    
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
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
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || (index === 0 ? 'contained' : 'outlined')}
              startIcon={action.icon}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      )}
    </Box>
    
    {stats && (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Box>
              <Typography variant="h4" color={stat.trend === 'up' ? 'success.main' : 'error.main'}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    )}
  </Box>
);`;

    return {
      name: 'Page Header',
      description: 'A comprehensive page header with title, breadcrumbs, actions, and stats',
      component: PageHeaderComponent,
      code,
      defaultProps: {
        title: 'Dashboard Overview',
        subtitle: 'Monitor your application performance and metrics',
        breadcrumbs: ['Analytics', 'Dashboard'],
        actions: [
          { label: 'Export', icon: <DownloadIcon /> },
          { label: 'Add Widget', icon: <AddIcon />, variant: 'contained' },
        ],
        stats: [
          { label: 'Total Users', value: '12,543', trend: 'up' },
          { label: 'Active Sessions', value: '3,421', trend: 'up' },
          { label: 'Bounce Rate', value: '24.5%', trend: 'down' },
          { label: 'Avg. Duration', value: '4m 32s', trend: 'up' },
        ],
      },
      variations: [
        {
          id: 'minimal',
          name: 'Minimal',
          description: 'Just title and subtitle',
          props: {
            title: 'Simple Page Title',
            subtitle: 'A clean and minimal page header',
          },
        },
        {
          id: 'with-breadcrumbs',
          name: 'With Breadcrumbs',
          description: 'Title with navigation breadcrumbs',
          props: {
            title: 'User Management',
            subtitle: 'Manage your team members and permissions',
            breadcrumbs: ['Settings', 'Team', 'Users'],
          },
        },
        {
          id: 'with-actions',
          name: 'With Actions',
          description: 'Header with action buttons',
          props: {
            title: 'Products',
            subtitle: 'Manage your product inventory',
            actions: [
              { label: 'Import', icon: <DownloadIcon /> },
              { label: 'Add Product', icon: <AddIcon />, variant: 'contained' },
            ],
          },
        },
        {
          id: 'full-featured',
          name: 'Full Featured',
          description: 'All elements included',
          props: {
            title: 'Analytics Dashboard',
            subtitle: 'Real-time insights and metrics',
            breadcrumbs: ['Home', 'Analytics', 'Overview'],
            actions: [
              { label: 'Filter', icon: <FilterIcon /> },
              { label: 'Export Report', icon: <DownloadIcon />, variant: 'contained' },
            ],
            stats: [
              { label: 'Revenue', value: '$45,231', trend: 'up' },
              { label: 'Orders', value: '1,234', trend: 'up' },
              { label: 'Conversion', value: '3.4%', trend: 'down' },
              { label: 'Avg. Order', value: '$36.67', trend: 'up' },
            ],
          },
        },
      ],
    };
  },
};

// User Card Component Template
const UserCardTemplate: ComponentTemplate = {
  name: 'User Card',
  matches: (spec) => spec.type === 'card' && spec.elements.some(e => e.label?.includes('user') || e.label?.includes('avatar')),
  generate: (spec) => {
    const UserCardComponent: React.FC<any> = (props) => (
      <Card sx={{ maxWidth: props.maxWidth || 360 }}>
        <CardContent>
          <Box display="flex" alignItems="flex-start" gap={2}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                props.status && (
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: props.status === 'online' ? 'success.main' : 'grey.400',
                      border: '2px solid white',
                    }}
                  />
                )
              }
            >
              <Avatar
                src={props.avatar}
                sx={{ width: 56, height: 56 }}
              >
                {props.name?.charAt(0)}
              </Avatar>
            </Badge>
            
            <Box flex={1}>
              <Typography variant="h6" component="div">
                {props.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {props.role}
              </Typography>
              {props.email && (
                <Typography variant="body2" color="text.secondary">
                  {props.email}
                </Typography>
              )}
              
              {props.badges && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {props.badges.map((badge: any, index: number) => (
                    <Chip
                      key={index}
                      label={badge.label}
                      size="small"
                      color={badge.color || 'default'}
                      variant={badge.variant || 'filled'}
                    />
                  ))}
                </Stack>
              )}
            </Box>
            
            {props.actions && (
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            )}
          </Box>
          
          {props.bio && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              {props.bio}
            </Typography>
          )}
          
          {props.stats && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {props.stats.map((stat: any, index: number) => (
                <Grid size={4} key={index}>
                  <Box textAlign="center">
                    <Typography variant="h6">{stat.value}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
          
          {props.actions && props.actions.length > 1 && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {props.actions.map((action: any, index: number) => (
                <Button
                  key={index}
                  variant={action.variant || 'outlined'}
                  size="small"
                  fullWidth
                  startIcon={action.icon}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    );

    const code = `import React from 'react';
import { Card, CardContent, Box, Typography, Avatar, Badge, Chip, Stack, Button, IconButton, Grid } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

export const UserCard = ({ name, role, email, avatar, status, badges, bio, stats, actions, maxWidth = 360 }) => (
  <Card sx={{ maxWidth }}>
    <CardContent>
      <Box display="flex" alignItems="flex-start" gap={2}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            status && (
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: status === 'online' ? 'success.main' : 'grey.400',
                  border: '2px solid white',
                }}
              />
            )
          }
        >
          <Avatar src={avatar} sx={{ width: 56, height: 56 }}>
            {name?.charAt(0)}
          </Avatar>
        </Badge>
        
        <Box flex={1}>
          <Typography variant="h6" component="div">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {role}
          </Typography>
          {email && (
            <Typography variant="body2" color="text.secondary">
              {email}
            </Typography>
          )}
          
          {badges && (
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {badges.map((badge, index) => (
                <Chip
                  key={index}
                  label={badge.label}
                  size="small"
                  color={badge.color || 'default'}
                  variant={badge.variant || 'filled'}
                />
              ))}
            </Stack>
          )}
        </Box>
        
        {actions && (
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        )}
      </Box>
      
      {bio && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          {bio}
        </Typography>
      )}
      
      {stats && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {stats.map((stat, index) => (
            <Grid item xs={4} key={index}>
              <Box textAlign="center">
                <Typography variant="h6">{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
      
      {actions && actions.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outlined'}
              size="small"
              fullWidth
              startIcon={action.icon}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      )}
    </CardContent>
  </Card>
);`;

    return {
      name: 'User Card',
      description: 'A user profile card with avatar, details, and actions',
      component: UserCardComponent,
      code,
      defaultProps: {
        name: 'Sarah Connor',
        role: 'Senior Developer',
        email: 'sarah.connor@company.com',
        avatar: '/api/placeholder/150/150',
        status: 'online',
        badges: [
          { label: 'Pro', color: 'primary' },
          { label: 'Verified', color: 'success' },
        ],
      },
      variations: [
        {
          id: 'minimal',
          name: 'Minimal',
          description: 'Basic user info only',
          props: {
            name: 'John Doe',
            role: 'Product Manager',
            avatar: '/api/placeholder/150/150',
          },
        },
        {
          id: 'with-status',
          name: 'With Status',
          description: 'User card with online status',
          props: {
            name: 'Jane Smith',
            role: 'UX Designer',
            email: 'jane.smith@company.com',
            avatar: '/api/placeholder/150/150',
            status: 'online',
          },
        },
        {
          id: 'with-stats',
          name: 'With Stats',
          description: 'Including user statistics',
          props: {
            name: 'Mike Johnson',
            role: 'Sales Manager',
            email: 'mike.j@company.com',
            avatar: '/api/placeholder/150/150',
            status: 'online',
            stats: [
              { label: 'Projects', value: '24' },
              { label: 'Tasks', value: '89' },
              { label: 'Points', value: '456' },
            ],
          },
        },
        {
          id: 'full-profile',
          name: 'Full Profile',
          description: 'Complete user profile card',
          props: {
            name: 'Emily Davis',
            role: 'Team Lead',
            email: 'emily.davis@company.com',
            avatar: '/api/placeholder/150/150',
            status: 'online',
            badges: [
              { label: 'Admin', color: 'error' },
              { label: '5 Years', color: 'info' },
            ],
            bio: 'Passionate about building great products and leading amazing teams. Coffee enthusiast and outdoor adventurer.',
            stats: [
              { label: 'Following', value: '234' },
              { label: 'Followers', value: '1.2k' },
              { label: 'Posts', value: '89' },
            ],
            actions: [
              { label: 'Message', variant: 'outlined' },
              { label: 'Follow', variant: 'contained' },
            ],
          },
        },
      ],
    };
  },
};

// Stats Dashboard Template
const StatsDashboardTemplate: ComponentTemplate = {
  name: 'Stats Dashboard',
  matches: (spec) => spec.type === 'dashboard' || spec.elements.some(e => e.dataType === 'metric'),
  generate: (spec) => {
    const StatsCardComponent: React.FC<any> = (props) => (
      <Grid container spacing={3}>
        {props.metrics?.map((metric: any, index: number) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {metric.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {metric.value}
                    </Typography>
                    {metric.change && (
                      <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                        {metric.change > 0 ? (
                          <TrendingUpIcon color="success" sx={{ fontSize: 20 }} />
                        ) : (
                          <TrendingDownIcon color="error" sx={{ fontSize: 20 }} />
                        )}
                        <Typography
                          variant="body2"
                          color={metric.change > 0 ? 'success.main' : 'error.main'}
                          sx={{ ml: 0.5 }}
                        >
                          {Math.abs(metric.change)}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  {metric.icon && (
                    <Avatar
                      sx={{
                        backgroundColor: metric.color || 'primary.main',
                        width: 48,
                        height: 48,
                      }}
                    >
                      {metric.icon}
                    </Avatar>
                  )}
                </Box>
                {metric.progress !== undefined && (
                  <LinearProgress
                    variant="determinate"
                    value={metric.progress}
                    sx={{ mt: 2 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );

    const code = `import React from 'react';
import { Grid, Card, CardContent, Box, Typography, Avatar, LinearProgress } from '@mui/material';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';

export const StatsCard = ({ metrics }) => (
  <Grid container spacing={3}>
    {metrics?.map((metric, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  {metric.title}
                </Typography>
                <Typography variant="h4" component="div">
                  {metric.value}
                </Typography>
                {metric.change && (
                  <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                    {metric.change > 0 ? (
                      <TrendingUpIcon color="success" sx={{ fontSize: 20 }} />
                    ) : (
                      <TrendingDownIcon color="error" sx={{ fontSize: 20 }} />
                    )}
                    <Typography
                      variant="body2"
                      color={metric.change > 0 ? 'success.main' : 'error.main'}
                      sx={{ ml: 0.5 }}
                    >
                      {Math.abs(metric.change)}%
                    </Typography>
                  </Box>
                )}
              </Box>
              {metric.icon && (
                <Avatar
                  sx={{
                    backgroundColor: metric.color || 'primary.main',
                    width: 48,
                    height: 48,
                  }}
                >
                  {metric.icon}
                </Avatar>
              )}
            </Box>
            {metric.progress !== undefined && (
              <LinearProgress
                variant="determinate"
                value={metric.progress}
                sx={{ mt: 2 }}
              />
            )}
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);`;

    return {
      name: 'Stats Dashboard',
      description: 'A metrics dashboard with multiple stat cards',
      component: StatsCardComponent,
      code,
      defaultProps: {
        metrics: [
          {
            title: 'Total Revenue',
            value: '$54,234',
            change: 12.5,
            icon: <TrendingUpIcon />,
            color: 'success.main',
          },
          {
            title: 'Active Users',
            value: '2,345',
            change: -5.3,
            icon: <PersonIcon />,
            color: 'primary.main',
          },
          {
            title: 'Conversion Rate',
            value: '3.45%',
            change: 8.1,
            progress: 68,
            color: 'info.main',
          },
          {
            title: 'Avg. Order Value',
            value: '$127.50',
            change: 3.2,
            color: 'warning.main',
          },
        ],
      },
      variations: [
        {
          id: 'simple',
          name: 'Simple Metrics',
          description: 'Basic metric cards without extras',
          props: {
            metrics: [
              { title: 'Users', value: '1,234' },
              { title: 'Revenue', value: '$12.5k' },
              { title: 'Orders', value: '456' },
              { title: 'Growth', value: '+15%' },
            ],
          },
        },
        {
          id: 'with-trends',
          name: 'With Trends',
          description: 'Metrics with trend indicators',
          props: {
            metrics: [
              { title: 'Sales', value: '$89,234', change: 15.3 },
              { title: 'Customers', value: '5,678', change: -2.1 },
              { title: 'Products', value: '234', change: 8.7 },
              { title: 'Revenue', value: '$234k', change: 12.4 },
            ],
          },
        },
        {
          id: 'with-progress',
          name: 'With Progress',
          description: 'Including progress bars',
          props: {
            metrics: [
              { title: 'Goal Progress', value: '75%', progress: 75 },
              { title: 'Team Capacity', value: '82%', progress: 82 },
              { title: 'Sprint Progress', value: '45%', progress: 45 },
              { title: 'Budget Used', value: '67%', progress: 67 },
            ],
          },
        },
      ],
    };
  },
};

export const componentTemplates: ComponentTemplate[] = [
  PageHeaderTemplate,
  UserCardTemplate,
  StatsDashboardTemplate,
];