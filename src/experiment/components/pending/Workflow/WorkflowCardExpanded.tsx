import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Stack,
  Avatar,
  AvatarGroup,
  Tooltip,
  IconButton,
  Divider,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Paper,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  Schedule,
  CheckCircle,
  PlayArrow,
  Warning,
  TrendingUp,
  MoreVert,
  AccessTime,
  Person,
  Flag,
  ExpandMore,
  ExpandLess,
  Edit,
  Delete,
  Add,
  Comment,
  AttachFile,
  Timeline,
  CalendarToday,
  Search,
} from '@mui/icons-material';

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  assignee?: {
    name: string;
    avatar?: string;
  };
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[];
  comments?: number;
  attachments?: number;
}

export interface WorkflowActivity {
  id: string;
  type: 'comment' | 'status_change' | 'assignment' | 'edit';
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  description: string;
}

export interface WorkflowCardExpandedProps {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'paused' | 'failed';
  progress: number;
  steps: WorkflowStep[];
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt?: Date;
  owner?: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
  activities?: WorkflowActivity[];
  metrics?: {
    estimatedDuration: number;
    actualDuration: number;
    efficiency: number;
  };
  onAction?: (action: string) => void;
  onStepAction?: (stepId: string, action: string) => void;
  onAddStep?: () => void;
}

export const WorkflowCardExpanded: React.FC<WorkflowCardExpandedProps> = ({
  title,
  description,
  status,
  progress,
  steps,
  priority = 'medium',
  dueDate,
  createdAt,
  owner,
  tags = [],
  activities = [],
  metrics,
  onAction,
  onStepAction,
  onAddStep,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    steps: true,
    activity: false,
    metrics: false,
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusColor = (status: WorkflowCardExpandedProps['status']) => {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'paused': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: WorkflowCardExpandedProps['status']) => {
    switch (status) {
      case 'active': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      case 'paused': return <Schedule />;
      case 'failed': return <Warning />;
    }
  };

  const getStepStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'in-progress': return <PlayArrow color="primary" />;
      case 'failed': return <Warning color="error" />;
      default: return <Schedule color="action" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const assignees = [...new Set(steps.map(s => s.assignee).filter(Boolean))];
  const filteredSteps = steps.filter(step => 
    step.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, overflow: 'auto' }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box flex={1}>
                <Typography variant="h5" gutterBottom>
                  {title}
                </Typography>
                {description && (
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {description}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={getStatusIcon(status)}
                  color={getStatusColor(status)}
                  size="small"
                >
                  {status}
                </Button>
                <IconButton 
                  size="small" 
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem onClick={() => { onAction?.('edit'); setAnchorEl(null); }}>
                    <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
                    Edit Workflow
                  </MenuItem>
                  <MenuItem onClick={() => { onAction?.('duplicate'); setAnchorEl(null); }}>
                    <ListItemIcon><Add fontSize="small" /></ListItemIcon>
                    Duplicate
                  </MenuItem>
                  <MenuItem onClick={() => { onAction?.('delete'); setAnchorEl(null); }}>
                    <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
                    Delete
                  </MenuItem>
                </Menu>
              </Stack>
            </Box>

            {/* Metadata */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
              {priority && (
                <Chip
                  icon={<Flag fontSize="small" />}
                  label={`${priority} priority`}
                  color={getPriorityColor(priority)}
                  size="small"
                />
              )}
              {owner && (
                <Chip
                  icon={<Person fontSize="small" />}
                  label={owner.name}
                  size="small"
                  variant="outlined"
                />
              )}
              {dueDate && (
                <Chip
                  icon={<CalendarToday fontSize="small" />}
                  label={`Due ${dueDate.toLocaleDateString()}`}
                  size="small"
                  variant="outlined"
                  color={new Date() > dueDate ? 'error' : 'default'}
                />
              )}
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>

          {/* Progress Overview */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1">
                Overall Progress
              </Typography>
              <Typography variant="h5" color="primary">
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color={getStatusColor(status)}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {completedSteps} of {steps.length} steps completed
              </Typography>
              <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
                {assignees.map((assignee, index) => (
                  <Tooltip key={index} title={assignee?.name || ''}>
                    <Avatar src={assignee?.avatar} sx={{ width: 24, height: 24 }}>
                      {assignee?.name?.[0]}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            </Box>
          </Paper>

          {/* Workflow Steps Section */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6">
                  Workflow Steps
                </Typography>
                <IconButton size="small" onClick={() => toggleSection('steps')}>
                  {expandedSections.steps ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Search steps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 200 }}
                />
                {onAddStep && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={onAddStep}
                  >
                    Add Step
                  </Button>
                )}
              </Stack>
            </Box>
            
            <Collapse in={expandedSections.steps}>
              <List>
                {filteredSteps.map((step, index) => (
                  <ListItem
                    key={step.id}
                    sx={{
                      bgcolor: 'background.paper',
                      mb: 1,
                      borderRadius: 1,
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <ListItemIcon>
                      {getStepStatusIcon(step.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2">
                            {index + 1}. {step.name}
                          </Typography>
                          {step.status === 'in-progress' && (
                            <Chip label="Current" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          {step.description && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {step.description}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            {step.assignee && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <Avatar src={step.assignee.avatar} sx={{ width: 20, height: 20 }}>
                                  {step.assignee.name[0]}
                                </Avatar>
                                <Typography variant="caption">
                                  {step.assignee.name}
                                </Typography>
                              </Box>
                            )}
                            {step.estimatedHours && (
                              <Typography variant="caption" color="text.secondary">
                                Est: {step.estimatedHours}h
                              </Typography>
                            )}
                            {step.actualHours && (
                              <Typography variant="caption" color="text.secondary">
                                Actual: {step.actualHours}h
                              </Typography>
                            )}
                            {step.comments && step.comments > 0 && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <Comment fontSize="small" />
                                <Typography variant="caption">{step.comments}</Typography>
                              </Box>
                            )}
                            {step.attachments && step.attachments > 0 && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <AttachFile fontSize="small" />
                                <Typography variant="caption">{step.attachments}</Typography>
                              </Box>
                            )}
                          </Stack>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        size="small"
                        onClick={() => onStepAction?.(step.id, 'edit')}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>

          {/* Activity Timeline */}
          {activities.length > 0 && (
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="h6">
                  Recent Activity
                </Typography>
                <IconButton size="small" onClick={() => toggleSection('activity')}>
                  {expandedSections.activity ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              
              <Collapse in={expandedSections.activity}>
                <List dense>
                  {activities.slice(0, 5).map((activity) => (
                    <ListItem key={activity.id} alignItems="flex-start">
                      <ListItemIcon>
                        <Avatar src={activity.user.avatar} sx={{ width: 32, height: 32 }}>
                          {activity.user.name[0]}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {activity.user.name} • {activity.timestamp.toLocaleString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          )}

          {/* Metrics */}
          {metrics && (
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="h6">
                  Performance Metrics
                </Typography>
                <IconButton size="small" onClick={() => toggleSection('metrics')}>
                  {expandedSections.metrics ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              
              <Collapse in={expandedSections.metrics}>
                <Grid container spacing={2}>
                  <Grid size={4}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Timeline color="primary" />
                      <Typography variant="h6">
                        {metrics.estimatedDuration}h
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Estimated Duration
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={4}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <AccessTime color="primary" />
                      <Typography variant="h6">
                        {metrics.actualDuration}h
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Actual Duration
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={4}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <TrendingUp color={metrics.efficiency >= 100 ? 'success' : 'warning'} />
                      <Typography variant="h6">
                        {metrics.efficiency}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Efficiency
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Collapse>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};