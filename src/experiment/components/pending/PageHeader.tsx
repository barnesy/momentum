import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Paper,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    icon?: React.ReactNode;
  }>;
  user?: {
    name: string;
    avatar?: string;
    role?: string;
    department?: string;
  };
  metadata?: {
    created?: Date;
    updated?: Date;
    location?: string;
    status?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    tags?: string[];
  };
  actions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    tooltip?: string;
  }>;
  variant?: 'default' | 'compact' | 'detailed';
  showDivider?: boolean;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'error';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'approved':
    case 'completed':
      return 'success';
    case 'pending':
    case 'draft':
      return 'warning';
    case 'rejected':
    case 'cancelled':
      return 'error';
    case 'in-progress':
      return 'info';
    default:
      return 'default';
  }
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  user,
  metadata,
  actions = [],
  variant = 'default',
  showDivider = true,
}) => {
  const renderBreadcrumbs = () => {
    if (breadcrumbs.length === 0) return null;

    return (
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // Handle home navigation
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <Link
            key={index}
            color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
            href={crumb.href || '#'}
            onClick={(e) => {
              if (!crumb.href) e.preventDefault();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: index === breadcrumbs.length - 1 ? 'none' : 'underline',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {crumb.icon && <Box sx={{ mr: 0.5 }}>{crumb.icon}</Box>}
            {crumb.label}
          </Link>
        ))}
      </Breadcrumbs>
    );
  };

  const renderUserInfo = () => {
    if (!user) return null;

    return (
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar src={user.avatar} sx={{ width: 40, height: 40 }}>
          {user.name[0]}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {user.name}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {user.role && (
              <Chip
                label={user.role}
                size="small"
                variant="outlined"
                icon={<PersonIcon />}
              />
            )}
            {user.department && (
              <Chip
                label={user.department}
                size="small"
                variant="outlined"
                icon={<BusinessIcon />}
              />
            )}
          </Stack>
        </Box>
      </Stack>
    );
  };

  const renderMetadata = () => {
    if (!metadata) return null;

    return (
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        {metadata.created && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ScheduleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Created: {metadata.created.toLocaleDateString()}
            </Typography>
          </Stack>
        )}
        {metadata.updated && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ScheduleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Updated: {metadata.updated.toLocaleDateString()}
            </Typography>
          </Stack>
        )}
        {metadata.location && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LocationIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {metadata.location}
            </Typography>
          </Stack>
        )}
        {metadata.status && (
          <Chip
            label={metadata.status}
            size="small"
            color={getStatusColor(metadata.status) as any}
          />
        )}
        {metadata.priority && (
          <Chip
            label={metadata.priority.toUpperCase()}
            size="small"
            color={getPriorityColor(metadata.priority) as any}
          />
        )}
        {metadata.tags && metadata.tags.length > 0 && (
          <Stack direction="row" spacing={0.5}>
            {metadata.tags.slice(0, 3).map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" />
            ))}
            {metadata.tags.length > 3 && (
              <Chip label={`+${metadata.tags.length - 3}`} size="small" variant="outlined" />
            )}
          </Stack>
        )}
      </Stack>
    );
  };

  const renderActions = () => {
    if (actions.length === 0) return null;

    return (
      <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
        {actions.map((action, index) => (
          <Tooltip key={index} title={action.tooltip || action.label}>
            <IconButton
              onClick={action.onClick}
              disabled={action.disabled}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              {action.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Stack>
    );
  };

  if (variant === 'compact') {
    return (
      <Box sx={{ mb: 3 }}>
        {renderBreadcrumbs()}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" component="h1" gutterBottom={false}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {renderActions()}
        </Stack>
        {showDivider && <Divider sx={{ mt: 2 }} />}
      </Box>
    );
  }

  if (variant === 'detailed') {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        {renderBreadcrumbs()}
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {subtitle}
              </Typography>
            )}
            {renderUserInfo()}
            {renderMetadata()}
          </Box>
          {renderActions()}
        </Stack>
        {showDivider && <Divider sx={{ mt: 2 }} />}
      </Paper>
    );
  }

  // Default variant
  return (
    <Box sx={{ mb: 3 }}>
      {renderBreadcrumbs()}
      <Stack direction="row" alignItems="flex-start" spacing={2}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {subtitle}
            </Typography>
          )}
          {renderUserInfo()}
          {renderMetadata()}
        </Box>
        {renderActions()}
      </Stack>
      {showDivider && <Divider sx={{ mt: 2 }} />}
    </Box>
  );
};

export default PageHeader; 