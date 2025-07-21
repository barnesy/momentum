import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Button,
  LinearProgress,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

export interface FinancialGoal {
  id: string | number;
  name: string;
  target: number;
  current: number;
  deadline: string;
  category?: string;
  description?: string;
}

interface FinancialGoalCardProps {
  goals: FinancialGoal[];
  onAddGoal?: () => void;
  onGoalClick?: (goal: FinancialGoal) => void;
}

export const FinancialGoalCard: React.FC<FinancialGoalCardProps> = ({
  goals,
  onAddGoal,
  onGoalClick,
}) => {
  const theme = useTheme();

  const calculateDaysLeft = (deadline: string) => {
    const days = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const getGoalStatus = (goal: FinancialGoal) => {
    const progress = (goal.current / goal.target) * 100;
    const daysLeft = calculateDaysLeft(goal.deadline);

    if (progress >= 100) return { color: 'success', label: 'Completed' };
    if (daysLeft < 0) return { color: 'error', label: 'Overdue' };
    if (daysLeft < 30) return { color: 'warning', label: 'Due Soon' };
    return { color: 'info', label: 'On Track' };
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Financial Goals
        </Typography>

        <Stack spacing={3} sx={{ mt: 2 }}>
          {goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            const daysLeft = calculateDaysLeft(goal.deadline);
            const status = getGoalStatus(goal);

            return (
              <Box
                key={goal.id}
                onClick={() => onGoalClick?.(goal)}
                sx={{
                  cursor: onGoalClick ? 'pointer' : 'default',
                  '&:hover': onGoalClick
                    ? {
                        bgcolor: theme.palette.action.hover,
                        borderRadius: 1,
                        mx: -1,
                        px: 1,
                      }
                    : {},
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" fontWeight="medium">
                      {goal.name}
                    </Typography>
                    {progress >= 100 && (
                      <CheckCircleIcon color="success" fontSize="small" />
                    )}
                  </Box>
                  <Chip
                    label={status.label}
                    color={status.color as any}
                    size="small"
                    icon={<ScheduleIcon />}
                  />
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progress, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          bgcolor:
                            progress >= 100
                              ? theme.palette.success.main
                              : theme.palette.info.main,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ minWidth: 100, textAlign: 'right' }}>
                    ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(progress)}% complete
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Past deadline'}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>

        {onAddGoal && (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{ mt: 3 }}
            onClick={onAddGoal}
          >
            Add New Goal
          </Button>
        )}
      </CardContent>
    </Card>
  );
};