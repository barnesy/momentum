import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

/**
 * @component UserProfileCard
 * @category Data Display
 * @description Displays user profile information with avatar, name, role, and optional actions
 */
export const UserProfileCard = ({ name, role, email, avatar, status, onEdit }) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={avatar} alt={name} sx={{ width: 56, height: 56 }}>
            {name?.[0]}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6">{name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {role}
            </Typography>
          </Box>
          {status && (
            <Chip 
              label={status} 
              size="small"
              color={status === 'active' ? 'success' : 'default'}
            />
          )}
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          {email}
        </Typography>
        {onEdit && (
          <Button size="small" onClick={onEdit} sx={{ mt: 1 }}>
            Edit Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * @component UserProfileCardCompact
 * @category Data Display
 * @description Compact version of UserProfileCard with minimal spacing
 */
export const UserProfileCardCompact = ({ name, role, avatar, status }) => {
  return (
    <Card>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar src={avatar} alt={name} sx={{ width: 40, height: 40 }}>
            {name?.[0]}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography variant="body1" noWrap>{name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {role}
            </Typography>
          </Box>
          {status && (
            <Chip 
              label={status} 
              size="small"
              color={status === 'active' ? 'success' : 'default'}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * @component MetricsCard
 * @category Data Display
 * @description Displays a single metric with optional trend indicator
 */
export const MetricsCard = ({ title, value, trend, icon, suffix = '' }) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value}{suffix}
            </Typography>
            {trend !== undefined && (
              <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                {trend > 0 ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography 
                  variant="body2" 
                  color={trend > 0 ? 'success.main' : 'error.main'}
                >
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          {icon && (
            <Box sx={{ color: 'primary.main' }}>
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * @component MetricsCardCompact
 * @category Data Display
 * @description Compact metrics display for dashboards
 */
export const MetricsCardCompact = ({ title, value, trend }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {title}
      </Typography>
      <Box display="flex" alignItems="baseline" gap={1}>
        <Typography variant="h5">{value}</Typography>
        {trend !== undefined && (
          <Typography 
            variant="caption" 
            color={trend > 0 ? 'success.main' : 'error.main'}
          >
            {trend > 0 ? '+' : ''}{trend}%
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

/**
 * @component DataTableCompact
 * @category Data Display
 * @description Compact data table with hover effects
 */
export const DataTableCompact = ({ columns, rows, onRowClick, actions }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.field}>
                {column.headerName}
              </TableCell>
            ))}
            {actions && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={row.id || index}
              hover
              onClick={() => onRowClick?.(row)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((column) => (
                <TableCell key={column.field}>
                  {column.render ? column.render(row[column.field], row) : row[column.field]}
                </TableCell>
              ))}
              {actions && (
                <TableCell align="right">
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); actions(row); }}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/**
 * @component UserList
 * @category Data Display
 * @description List of users with avatars and actions
 */
export const UserList = ({ users, onEdit, onDelete }) => {
  return (
    <List>
      {users.map((user, index) => (
        <React.Fragment key={user.id || index}>
          {index > 0 && <Divider variant="inset" component="li" />}
          <ListItem>
            <ListItemAvatar>
              <Avatar src={user.avatar} alt={user.name}>
                {user.name?.[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={user.name}
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="text.primary">
                    {user.role}
                  </Typography>
                  {' — '}{user.email}
                </React.Fragment>
              }
            />
            <ListItemSecondaryAction>
              <Stack direction="row" spacing={1}>
                {onEdit && (
                  <IconButton edge="end" size="small" onClick={() => onEdit(user)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                {onDelete && (
                  <IconButton edge="end" size="small" onClick={() => onDelete(user)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </ListItemSecondaryAction>
          </ListItem>
        </React.Fragment>
      ))}
    </List>
  );
};

/**
 * @component StatsGrid
 * @category Data Display
 * @description Grid of statistics with icons and trends
 */
export const StatsGrid = ({ stats, columns = 4 }) => {
  return (
    <Box display="grid" gridTemplateColumns={`repeat(${columns}, 1fr)`} gap={2}>
      {stats.map((stat, index) => (
        <Paper key={index} sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            {stat.icon && <Box color="primary.main">{stat.icon}</Box>}
            <Typography variant="caption" color="text.secondary">
              {stat.label}
            </Typography>
          </Box>
          <Typography variant="h5">{stat.value}</Typography>
          {stat.change && (
            <Typography 
              variant="caption" 
              color={stat.change > 0 ? 'success.main' : 'error.main'}
            >
              {stat.change > 0 ? '+' : ''}{stat.change}%
            </Typography>
          )}
        </Paper>
      ))}
    </Box>
  );
};