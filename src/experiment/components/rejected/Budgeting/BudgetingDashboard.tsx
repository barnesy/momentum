import React from 'react';
import { Grid, Box } from '@mui/material';
import { BudgetOverviewCard } from './BudgetOverviewCard';
import { BudgetCategoryCard, BudgetCategory } from '../../approved/BudgetCategoryCard';
import { ExpenseTrackerCard, Expense } from './ExpenseTrackerCard';
import { BudgetProgressCard } from './BudgetProgressCard';
import { FinancialGoalCard, FinancialGoal } from './FinancialGoalCard';

// Sample data for demonstration
const sampleCategories: BudgetCategory[] = [
  { name: 'Housing', budget: 1500, spent: 1500, icon: '🏠' },
  { name: 'Food', budget: 600, spent: 452, icon: '🍕' },
  { name: 'Transport', budget: 400, spent: 380, icon: '🚗' },
  { name: 'Entertainment', budget: 300, spent: 198, icon: '🎬' },
  { name: 'Healthcare', budget: 200, spent: 150, icon: '🏥' },
  { name: 'Shopping', budget: 250, spent: 289, icon: '🛍️' },
];

const sampleExpenses: Expense[] = [
  { id: 1, description: 'Grocery Store', amount: 125.43, category: 'Food', date: '2025-01-20' },
  { id: 2, description: 'Gas Station', amount: 65.00, category: 'Transport', date: '2025-01-19' },
  { id: 3, description: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', date: '2025-01-15' },
  { id: 4, description: 'Electric Bill', amount: 245.00, category: 'Utilities', date: '2025-01-10' },
  { id: 5, description: 'Restaurant', amount: 78.50, category: 'Food', date: '2025-01-08' },
];

const sampleGoals: FinancialGoal[] = [
  { id: 1, name: 'Emergency Fund', target: 10000, current: 7500, deadline: '2025-06-30' },
  { id: 2, name: 'Vacation to Europe', target: 3000, current: 1200, deadline: '2025-08-15' },
  { id: 3, name: 'New MacBook Pro', target: 2500, current: 800, deadline: '2025-04-01' },
  { id: 4, name: 'Home Down Payment', target: 25000, current: 12000, deadline: '2026-01-01' },
];

export const BudgetingDashboard: React.FC = () => {
  const totalBudget = sampleCategories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = sampleCategories.reduce((sum, cat) => sum + cat.spent, 0);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <BudgetOverviewCard
            totalBudget={totalBudget}
            spent={totalSpent}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <BudgetProgressCard
            monthlyGoal={totalBudget}
            currentSpending={totalSpent}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <BudgetCategoryCard
            categories={sampleCategories}
            onCategoryClick={(category) => {/* Category click handler */}}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ExpenseTrackerCard
            expenses={sampleExpenses}
            onAddExpense={() => {/* Add expense handler */}}
            onEditExpense={(expense) => {/* Edit expense handler */}}
            onDeleteExpense={(expense) => {/* Delete expense handler */}}
          />
        </Grid>
        <Grid size={12}>
          <FinancialGoalCard
            goals={sampleGoals}
            onAddGoal={() => {/* Add goal handler */}}
            onGoalClick={(goal) => {/* Goal click handler */}}
          />
        </Grid>
      </Grid>
    </Box>
  );
};