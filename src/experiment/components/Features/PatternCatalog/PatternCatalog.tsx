import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Button,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  Visibility as PreviewIcon,
} from '@mui/icons-material';
import * as patterns from '../../../patterns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const PatternCatalog: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  const categories = Object.entries(patterns.patternCategories);
  const allPatterns = Object.values(patterns.patternCategories).flat();

  const filteredPatterns = searchQuery
    ? allPatterns.filter(pattern =>
        pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patterns.patternDescriptions[pattern]?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tabValue === 0
    ? allPatterns
    : categories[tabValue - 1][1];

  const handleCopyUsage = (patternName: string) => {
    const usage = `import { ${patternName} } from '@/patterns';\n\n<${patternName} />`;
    navigator.clipboard.writeText(usage);
  };

  const renderPatternCard = (patternName: string) => {
    const Component = patterns[patternName as keyof typeof patterns] as React.FC<any>;
    const description = patterns.patternDescriptions[patternName];

    // Sample props for preview
    const sampleProps: Record<string, any> = {
      // Data Display
      UserProfileCard: { name: 'John Doe', role: 'Developer', email: 'john@example.com', status: 'active' },
      UserProfileCardCompact: { name: 'Jane Smith', role: 'Designer', avatar: '', status: 'active' },
      MetricsCard: { title: 'Revenue', value: '$12,345', trend: 12.5 },
      MetricsCardCompact: { title: 'Users', value: '1,234', trend: -5 },
      DataTableCompact: {
        columns: [
          { field: 'name', headerName: 'Name' },
          { field: 'role', headerName: 'Role' },
        ],
        rows: [
          { id: 1, name: 'John Doe', role: 'Developer' },
          { id: 2, name: 'Jane Smith', role: 'Designer' },
        ],
      },
      UserList: {
        users: [
          { id: 1, name: 'John Doe', role: 'Developer', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', role: 'Designer', email: 'jane@example.com' },
        ],
      },
      StatsGrid: {
        stats: [
          { label: 'Total Users', value: '1,234', change: 12 },
          { label: 'Revenue', value: '$45.2K', change: -5 },
          { label: 'Active Projects', value: '23' },
          { label: 'Completion Rate', value: '87%', change: 3 },
        ],
      },
      
      // Layout
      HeaderWithActions: {
        title: 'Dashboard',
        subtitle: 'Welcome back to your dashboard',
        breadcrumbs: [{ label: 'Home' }, { label: 'Dashboard' }],
        actions: [
          <Button key="1" variant="outlined" size="small">Export</Button>,
          <Button key="2" variant="contained" size="small">Add New</Button>,
        ],
      },
      HeaderSimple: { title: 'Simple Header' },
      PageContainer: { children: <Typography>Page content goes here</Typography> },
      SectionDivider: { title: 'Section Title' },
      TwoColumnLayout: {
        left: <Paper sx={{ p: 2 }}><Typography>Left Column</Typography></Paper>,
        right: <Paper sx={{ p: 2 }}><Typography>Right Column</Typography></Paper>,
      },
      EmptyState: {
        title: 'No data found',
        message: 'Try adjusting your filters or add new items to get started.',
        action: <Button variant="contained" size="small">Add Item</Button>,
      },
      LoadingState: { message: 'Loading data...' },
      
      // Forms
      FormFieldGroup: {
        fields: [
          { name: 'name', label: 'Name', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'role', label: 'Role', type: 'select', options: [
            { value: 'developer', label: 'Developer' },
            { value: 'designer', label: 'Designer' },
          ]},
        ],
        values: {},
        onChange: () => {},
      },
      SearchBarWithFilters: {
        value: '',
        onChange: () => {},
        filters: [
          { value: 'active', label: 'Active', active: true },
          { value: 'archived', label: 'Archived', active: false },
        ],
        onFilterChange: () => {},
      },
      LoginForm: { onSubmit: () => {} },
      SettingsForm: {
        settings: [
          { name: 'notifications', label: 'Email Notifications', type: 'switch', value: true },
          { name: 'theme', label: 'Theme', type: 'select', value: 'light', options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]},
        ],
        onChange: () => {},
      },
      FilterPanel: {
        filters: [
          { 
            name: 'status', 
            label: 'Status', 
            type: 'checkbox-group',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'pending', label: 'Pending' },
              { value: 'archived', label: 'Archived' },
            ]
          },
          {
            name: 'priority',
            label: 'Priority',
            type: 'radio',
            options: [
              { value: 'all', label: 'All' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]
          }
        ],
        values: {},
        onChange: () => {},
        onApply: () => {},
        onReset: () => {},
      },
      AutocompleteSearch: {
        options: ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'],
        value: null,
        onChange: () => {},
        placeholder: 'Search fruits...',
      },
    };

    return (
      <Card key={patternName} sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {patternName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {description}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Copy Usage">
                <IconButton size="small" onClick={() => handleCopyUsage(patternName)}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="View Code">
                <IconButton size="small" onClick={() => setSelectedPattern(patternName)}>
                  <CodeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              bgcolor: 'background.default',
              maxHeight: 300,
              overflow: 'auto'
            }}
          >
            {Component && <Component {...(sampleProps[patternName] || {})} />}
          </Paper>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Pattern Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Browse and use pre-built Material-UI component patterns. Click on any pattern to see usage examples.
          </Typography>

          <TextField
            fullWidth
            placeholder="Search patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
              <Tab label={`All (${allPatterns.length})`} />
              {categories.map(([category, items]) => (
                <Tab key={category} label={`${category} (${items.length})`} />
              ))}
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {filteredPatterns.map((pattern) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={pattern}>
                  {renderPatternCard(pattern)}
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {categories.map(([category, categoryPatterns], index) => (
            <TabPanel key={category} value={tabValue} index={index + 1}>
              <Grid container spacing={3}>
                {(searchQuery ? filteredPatterns : categoryPatterns).map((pattern) => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={pattern}>
                    {renderPatternCard(pattern)}
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          ))}

          {filteredPatterns.length === 0 && (
            <Box py={4} textAlign="center">
              <Typography color="text.secondary">
                No patterns found matching "{searchQuery}"
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};