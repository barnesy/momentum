import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Stack,
  Alert,
  LinearProgress,
  useTheme,
} from '@mui/material';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';

interface BudgetProgressCardProps {
  monthlyGoal: number;
  currentSpending: number;
  daysInMonth?: number;
  currentDay?: number;
}

export const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({
  monthlyGoal,
  currentSpending,
  daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
  currentDay = new Date().getDate(),
}) => {
  const theme = useTheme();
  const progressPercent = (currentSpending / monthlyGoal) * 100;
  const timePercent = (currentDay / daysInMonth) * 100;
  const projectedSpending = (currentSpending / currentDay) * daysInMonth;
  const isOnTrack = projectedSpending <= monthlyGoal;

  const getProgressColor = () => {
    if (progressPercent > 100) return theme.palette.error.main;
    if (progressPercent > 80) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Spending Progress
        </Typography>

        <Box
          sx={{
            position: 'relative',
            display: 'inline-flex',
            width: '100%',
            justifyContent: 'center',
            my: 3,
          }}
        >
          <CircularProgress
            variant="determinate"
            value={Math.min(progressPercent, 100)}
            size={120}
            thickness={4}
            sx={{ color: getProgressColor() }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box textAlign="center">
              <Typography variant="h5" component="div" color="text.primary">
                {Math.round(progressPercent)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                of budget
              </Typography>
            </Box>
          </Box>
        </Box>

        <Stack spacing={2}>
          <Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Time elapsed
              </Typography>
              <Typography variant="body2">
                {currentDay} / {daysInMonth} days ({Math.round(timePercent)}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={timePercent}
              sx={{
                mt: 0.5,
                height: 4,
                borderRadius: 1,
                bgcolor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  bgcolor: theme.palette.info.main,
                },
              }}
            />
          </Box>

          <Alert
            severity={isOnTrack ? 'success' : 'warning'}
            icon={<TrendingUpIcon />}
            sx={{ py: 1 }}
          >
            <Typography variant="body2">
              Projected spending: <strong>${Math.round(projectedSpending).toLocaleString()}</strong>
              {!isOnTrack && (
                <>
                  {' '}
                  (${Math.round(projectedSpending - monthlyGoal).toLocaleString()} over budget)
                </>
              )}
            </Typography>
          </Alert>
        </Stack>
      </CardContent>
    </Card>
  );
};