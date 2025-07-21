import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  useTheme,
} from '@mui/material';

interface BudgetOverviewCardProps {
  totalBudget: number;
  spent: number;
  month?: string;
  year?: number;
}

export const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({
  totalBudget,
  spent,
  month = new Date().toLocaleString('default', { month: 'long' }),
  year = new Date().getFullYear(),
}) => {
  const theme = useTheme();
  const remaining = totalBudget - spent;
  const percentUsed = (spent / totalBudget) * 100;
  const isOverBudget = spent > totalBudget;

  const getProgressColor = () => {
    if (isOverBudget) return theme.palette.error.main;
    if (percentUsed > 80) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  return (
    <Card>
      <CardContent sx={{ py: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={1.5}>
          <Typography variant="subtitle1" fontWeight="medium">
            {month} Budget
          </Typography>
          <Typography variant="h6" fontWeight="bold" color={isOverBudget ? 'error.main' : 'text.primary'}>
            ${spent.toLocaleString()} / ${totalBudget.toLocaleString()}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={Math.min(percentUsed, 100)}
          sx={{
            height: 6,
            borderRadius: 1,
            bgcolor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              bgcolor: getProgressColor(),
            },
          }}
        />

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="caption" color="text.secondary">
            {Math.round(percentUsed)}% used
          </Typography>
          <Typography 
            variant="body2" 
            color={isOverBudget ? 'error.main' : 'success.main'}
            fontWeight="medium"
          >
            ${Math.abs(remaining).toLocaleString()} {isOverBudget ? 'over' : 'left'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};