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
} from '@mui/material';
import {
  Schedule,
  CheckCircle,
  PlayArrow,
  Warning,
  TrendingUp,
} from '@mui/icons-material';

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  assignee?: {
    name: string;
    avatar?: string;
  };
}

export interface WorkflowCardCompactProps {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'paused' | 'failed';
  progress: number;
  steps: WorkflowStep[];
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  onClick?: () => void;
}

export const WorkflowCardCompact: React.FC<WorkflowCardCompactProps> = ({
  title,
  status,
  progress,
  steps,
  priority = 'medium',
  dueDate,
  onClick,
}) => {
  const getStatusColor = (status: WorkflowCardCompactProps['status']) => {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'paused': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: WorkflowCardCompactProps['status']) => {
    switch (status) {
      case 'active': return <PlayArrow fontSize="small" />;
      case 'completed': return <CheckCircle fontSize="small" />;
      case 'paused': return <Schedule fontSize="small" />;
      case 'failed': return <Warning fontSize="small" />;
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

  return (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 2,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1.5}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <Typography variant="subtitle2" noWrap>
                {title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Chip
                  size="small"
                  icon={getStatusIcon(status)}
                  label={status}
                  color={getStatusColor(status)}
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
                {priority && (
                  <Chip
                    size="small"
                    icon={<TrendingUp fontSize="small" />}
                    label={priority}
                    color={getPriorityColor(priority)}
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            </Box>
            {assignees.length > 0 && (
              <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                {assignees.map((assignee, index) => (
                  <Tooltip key={index} title={assignee?.name || ''}>
                    <Avatar src={assignee?.avatar} sx={{ width: 24, height: 24 }}>
                      {assignee?.name?.[0]}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            )}
          </Box>

          {/* Progress */}
          <Box>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                {completedSteps}/{steps.length} steps
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color={getStatusColor(status)}
              sx={{ height: 4, borderRadius: 2 }}
            />
          </Box>

          {/* Footer */}
          {dueDate && (
            <Typography variant="caption" color="text.secondary">
              Due: {dueDate.toLocaleDateString()}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};