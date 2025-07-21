import React from 'react';
import { Box, Grid, Typography, Paper, Stack } from '@mui/material';
import { BudgetCategoryCard, BudgetCategory } from './BudgetCategoryCard';

// Sample data sets for different scenarios
const minimalCategories: BudgetCategory[] = [
  { name: 'Housing', budget: 1500, spent: 1500, icon: '🏠' },
  { name: 'Food', budget: 600, spent: 452, icon: '🍕' },
  { name: 'Transport', budget: 400, spent: 380, icon: '🚗' },
];

const standardCategories: BudgetCategory[] = [
  { name: 'Housing', budget: 1500, spent: 1500, icon: '🏠' },
  { name: 'Food', budget: 600, spent: 452, icon: '🍕' },
  { name: 'Transport', budget: 400, spent: 380, icon: '🚗' },
  { name: 'Entertainment', budget: 300, spent: 198, icon: '🎬' },
  { name: 'Healthcare', budget: 200, spent: 150, icon: '🏥' },
  { name: 'Shopping', budget: 250, spent: 289, icon: '🛍️' },
];

const overBudgetScenario: BudgetCategory[] = [
  { name: 'Housing', budget: 1500, spent: 1500, icon: '🏠' },
  { name: 'Food', budget: 600, spent: 780, icon: '🍕' }, // Over budget
  { name: 'Transport', budget: 400, spent: 520, icon: '🚗' }, // Over budget
  { name: 'Entertainment', budget: 300, spent: 450, icon: '🎬' }, // Over budget
];

const underBudgetScenario: BudgetCategory[] = [
  { name: 'Housing', budget: 1500, spent: 1200, icon: '🏠' },
  { name: 'Food', budget: 600, spent: 250, icon: '🍕' },
  { name: 'Transport', budget: 400, spent: 150, icon: '🚗' },
  { name: 'Entertainment', budget: 300, spent: 50, icon: '🎬' },
];

export const BudgetCategoryCardPreview: React.FC = () => {
  const handleCategoryClick = (category: BudgetCategory) => {
    alert(`Clicked: ${category.name} - $${category.spent}/$${category.budget}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        BudgetCategoryCard Preview
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Showcasing the BudgetCategoryCard component in various layouts and scenarios
      </Typography>

      {/* Layout 1: Side by side comparison */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Layout 1: Side-by-Side Comparison
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Standard Budget
            </Typography>
            <BudgetCategoryCard 
              categories={standardCategories}
              onCategoryClick={handleCategoryClick}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Over Budget Scenario
            </Typography>
            <BudgetCategoryCard 
              categories={overBudgetScenario}
              onCategoryClick={handleCategoryClick}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Layout 2: Full width with different data sets */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Layout 2: Full Width Variations
        </Typography>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Minimal Categories (3 items)
            </Typography>
            <BudgetCategoryCard 
              categories={minimalCategories}
              onCategoryClick={handleCategoryClick}
            />
          </Box>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Under Budget (Good Performance)
            </Typography>
            <BudgetCategoryCard 
              categories={underBudgetScenario}
              onCategoryClick={handleCategoryClick}
            />
          </Box>
        </Stack>
      </Paper>

      {/* Layout 3: Grid of multiple cards */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Layout 3: Dashboard Grid
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <BudgetCategoryCard 
              categories={minimalCategories}
              onCategoryClick={handleCategoryClick}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <BudgetCategoryCard 
              categories={standardCategories.slice(0, 4)}
              onCategoryClick={handleCategoryClick}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <BudgetCategoryCard 
              categories={overBudgetScenario}
              onCategoryClick={handleCategoryClick}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Layout 4: Narrow column (sidebar simulation) */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Layout 4: Narrow Column (Sidebar)
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Sidebar View
              </Typography>
              <BudgetCategoryCard 
                categories={minimalCategories}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ bgcolor: 'grey.200', p: 3, borderRadius: 1, height: '100%' }}>
              <Typography variant="body1" color="text.secondary">
                Main content area
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Layout 5: Without click handlers */}
      <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Layout 5: Static Display (No Click Handler)
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <BudgetCategoryCard 
              categories={standardCategories}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Without onCategoryClick prop, the component displays data without hover effects or click interactions.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This is useful for read-only dashboards or reports.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};