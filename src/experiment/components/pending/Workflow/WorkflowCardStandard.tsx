import React from 'react';
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
} from '@mui/icons-material';

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  assignee?: {
    name: string;
    avatar?: string;
  };
  completedAt?: Date;
  estimatedHours?: number;
}

export interface WorkflowCardStandardProps {
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
  onAction?: () => void;
  onStepClick?: (stepId: string) => void;
}

export const WorkflowCardStandard: React.FC<WorkflowCardStandardProps> = ({
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
  onAction,
  onStepClick,
}) => {
  const getStatusColor = (status: WorkflowCardStandardProps['status']) => {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'paused': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: WorkflowCardStandardProps['status']) => {
    switch (status) {
      case 'active': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      case 'paused': return <Schedule />;
      case 'failed': return <Warning />;
    }
  };

  const getStepStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle fontSize="small" color="success" />;
      case 'in-progress': return <PlayArrow fontSize="small" color="primary" />;
      case 'failed': return <Warning fontSize="small" color="error" />;
      default: return <Schedule fontSize="small" color="action" />;
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
  const currentStep = steps.find(s => s.status === 'in-progress');

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box flex={1}>
                <Typography variant="h6" gutterBottom>
                  {title}
                </Typography>
                {description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {description}
                  </Typography>
                )}
              </Box>
              {onAction && (
                <IconButton size="small" onClick={onAction}>
                  <MoreVert />
                </IconButton>
              )}
            </Box>

            {/* Status and Meta */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={getStatusIcon(status)}
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                color={getStatusColor(status)}
                size="small"
              />
              {priority && (
                <Chip
                  icon={<Flag fontSize="small" />}
                  label={`${priority} priority`}
                  color={getPriorityColor(priority)}
                  variant="outlined"
                  size="small"
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

          <Divider />

          {/* Progress Section */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2">
                Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {completedSteps}/{steps.length} steps • {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color={getStatusColor(status)}
              sx={{ height: 6, borderRadius: 3 }}
            />
            {currentStep && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Current: {currentStep.name}
              </Typography>
            )}
          </Box>

          {/* Steps Preview */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Workflow Steps
            </Typography>
            <Stack spacing={1}>
              {steps.slice(0, 3).map((step) => (
                <Box 
                  key={step.id}
                  display="flex" 
                  alignItems="center" 
                  justifyContent="space-between"
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    cursor: onStepClick ? 'pointer' : 'default',
                    '&:hover': onStepClick ? { bgcolor: 'action.selected' } : {},
                  }}
                  onClick={() => onStepClick?.(step.id)}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {getStepStatusIcon(step.status)}
                    <Typography variant="body2">
                      {step.name}
                    </Typography>
                  </Box>
                  {step.assignee && (
                    <Tooltip title={step.assignee.name}>
                      <Avatar src={step.assignee.avatar} sx={{ width: 24, height: 24 }}>
                        {step.assignee.name[0]}
                      </Avatar>
                    </Tooltip>
                  )}
                </Box>
              ))}
              {steps.length > 3 && (
                <Button size="small" fullWidth>
                  View all {steps.length} steps
                </Button>
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Footer */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2}>
              {owner && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {owner.name}
                  </Typography>
                </Box>
              )}
              {dueDate && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Due {dueDate.toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Stack>
            {assignees.length > 0 && (
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28 } }}>
                {assignees.map((assignee, index) => (
                  <Tooltip key={index} title={assignee?.name || ''}>
                    <Avatar src={assignee?.avatar} sx={{ width: 28, height: 28 }}>
                      {assignee?.name?.[0]}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};