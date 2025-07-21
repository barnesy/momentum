import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  LinearProgress,
  useTheme,
} from '@mui/material';

export interface BudgetCategory {
  name: string;
  budget: number;
  spent: number;
  icon?: string;
  color?: string;
}

interface BudgetCategoryCardProps {
  categories: BudgetCategory[];
  onCategoryClick?: (category: BudgetCategory) => void;
}

export const BudgetCategoryCard: React.FC<BudgetCategoryCardProps> = ({
  categories,
  onCategoryClick,
}) => {
  const theme = useTheme();

  const getCategoryColor = (category: BudgetCategory) => {
    const percentUsed = (category.spent / category.budget) * 100;
    if (category.spent > category.budget) return theme.palette.error.main;
    if (percentUsed > 80) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Budget by Category
        </Typography>

        <Stack spacing={2} sx={{ mt: 2 }}>
          {categories.map((category) => {
            const percentUsed = (category.spent / category.budget) * 100;
            const isOverBudget = category.spent > category.budget;

            return (
              <Box
                key={category.name}
                onClick={() => onCategoryClick?.(category)}
                sx={{
                  cursor: onCategoryClick ? 'pointer' : 'default',
                  '&:hover': onCategoryClick
                    ? {
                        bgcolor: theme.palette.action.hover,
                        borderRadius: 1,
                        mx: -1,
                        px: 1,
                      }
                    : {},
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={0.5}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {category.icon && (
                      <Typography variant="h6">{category.icon}</Typography>
                    )}
                    <Typography variant="body2">{category.name}</Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color={isOverBudget ? 'error.main' : 'text.primary'}
                    fontWeight="bold"
                  >
                    ${category.spent} / ${category.budget}
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
                      bgcolor: getCategoryColor(category),
                    },
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};