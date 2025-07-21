import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

export interface Expense {
  id: string | number;
  description: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod?: string;
}

interface ExpenseTrackerCardProps {
  expenses: Expense[];
  onAddExpense?: () => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (expense: Expense) => void;
  categoryColors?: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'>;
}

export const ExpenseTrackerCard: React.FC<ExpenseTrackerCardProps> = ({
  expenses,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  categoryColors = {
    Food: 'success',
    Transport: 'info',
    Entertainment: 'warning',
    Utilities: 'error',
  },
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedExpense, setSelectedExpense] = React.useState<Expense | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, expense: Expense) => {
    setAnchorEl(event.currentTarget);
    setSelectedExpense(expense);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExpense(null);
  };

  const handleEdit = () => {
    if (selectedExpense && onEditExpense) {
      onEditExpense(selectedExpense);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedExpense && onDeleteExpense) {
      onDeleteExpense(selectedExpense);
    }
    handleMenuClose();
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Recent Expenses</Typography>
          {onAddExpense && (
            <Button size="small" startIcon={<AddIcon />} onClick={onAddExpense}>
              Add Expense
            </Button>
          )}
        </Box>

        <List sx={{ p: 0 }}>
          {expenses.map((expense, index) => (
            <React.Fragment key={expense.id}>
              <ListItem
                sx={{ px: 0 }}
                secondaryAction={
                  (onEditExpense || onDeleteExpense) && (
                    <IconButton
                      edge="end"
                      aria-label="more"
                      onClick={(e) => handleMenuOpen(e, expense)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemText
                  primary={expense.description}
                  secondary={new Date(expense.date).toLocaleDateString()}
                />
                <Box textAlign="right" sx={{ mr: 2 }}>
                  <Typography variant="body2" fontWeight="bold" color="error.main">
                    -${expense.amount.toFixed(2)}
                  </Typography>
                  <Chip
                    label={expense.category}
                    size="small"
                    color={categoryColors[expense.category] || 'default'}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </ListItem>
              {index < expenses.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {onEditExpense && <MenuItem onClick={handleEdit}>Edit</MenuItem>}
          {onDeleteExpense && <MenuItem onClick={handleDelete}>Delete</MenuItem>}
        </Menu>
      </CardContent>
    </Card>
  );
};