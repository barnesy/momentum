import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Alert,
  Tabs,
  Tab,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Schema as SchemaIcon,
  GeneratingTokens as GenerateIcon,
  ContentCopy as CopyIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { HeaderWithActions } from '../../../patterns';

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

// Default DBML schema for asset management
const defaultDBML = `// Asset Management System Schema

Table assets {
  id int [pk, increment]
  name varchar [not null]
  description text
  category_id int [ref: > categories.id]
  status_id int [ref: > asset_statuses.id]
  location_id int [ref: > locations.id]
  purchase_date date
  purchase_price decimal
  current_value decimal
  serial_number varchar
  model varchar
  manufacturer varchar
  assigned_to int [ref: > users.id]
  created_at timestamp [default: 'now()']
  updated_at timestamp
}

Table categories {
  id int [pk, increment]
  name varchar [not null]
  description text
  parent_id int [ref: > categories.id]
  icon varchar
  color varchar
}

Table asset_statuses {
  id int [pk, increment]
  name varchar [not null]
  description text
  color varchar
  is_active boolean [default: true]
}

Table locations {
  id int [pk, increment]
  name varchar [not null]
  building varchar
  floor varchar
  room varchar
  description text
}

Table users {
  id int [pk, increment]
  name varchar [not null]
  email varchar [unique, not null]
  department varchar
  role varchar
}

Table maintenance_logs {
  id int [pk, increment]
  asset_id int [ref: > assets.id]
  performed_by int [ref: > users.id]
  maintenance_type varchar
  description text
  cost decimal
  performed_at timestamp
  next_due_date date
}`;

interface ParsedTable {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    constraints: string[];
  }>;
}

export const DBMLEditor: React.FC = () => {
  const [dbml, setDBml] = useState(defaultDBML);
  const [tabValue, setTabValue] = useState(0);
  const [parsedTables, setParsedTables] = useState<ParsedTable[]>([]);
  const [generatedHeaders, setGeneratedHeaders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Parse DBML schema
  const parseDBML = useCallback((schema: string) => {
    try {
      const tables: ParsedTable[] = [];
      const tableRegex = /Table\s+(\w+)\s*{([^}]*)}/g;
      let match;

      while ((match = tableRegex.exec(schema)) !== null) {
        const tableName = match[1];
        const tableContent = match[2];
        const fields: ParsedTable['fields'] = [];

        const fieldRegex = /(\w+)\s+(\w+)(?:\s*\[([^\]]*)\])?/g;
        let fieldMatch;

        while ((fieldMatch = fieldRegex.exec(tableContent)) !== null) {
          fields.push({
            name: fieldMatch[1],
            type: fieldMatch[2],
            constraints: fieldMatch[3] ? fieldMatch[3].split(',').map(c => c.trim()) : []
          });
        }

        tables.push({ name: tableName, fields });
      }

      setParsedTables(tables);
      setError(null);
      return tables;
    } catch (err) {
      setError('Failed to parse DBML schema');
      return [];
    }
  }, []);

  // Generate PageHeader patterns based on schema
  const generatePatterns = useCallback(() => {
    const tables = parseDBML(dbml);
    const headers = tables.map(table => {
      const displayName = table.name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      // Generate breadcrumbs based on table relationships
      const breadcrumbs = [
        { label: 'Dashboard', href: '/' },
        { label: 'Asset Management', href: '/assets' },
        { label: displayName }
      ];

      // Generate actions based on table type
      const actions = [];
      if (table.name === 'assets') {
        actions.push(
          <Button key="add" variant="contained" size="small" startIcon={<GenerateIcon />}>
            Add Asset
          </Button>,
          <Button key="export" variant="outlined" size="small">
            Export
          </Button>
        );
      } else if (table.name === 'maintenance_logs') {
        actions.push(
          <Button key="schedule" variant="contained" size="small">
            Schedule Maintenance
          </Button>
        );
      } else {
        actions.push(
          <Button key="add" variant="contained" size="small">
            Add {displayName.slice(0, -1)}
          </Button>
        );
      }

      // Generate subtitle based on table purpose
      const subtitles: Record<string, string> = {
        assets: 'Manage and track all company assets',
        categories: 'Organize assets by type and purpose',
        asset_statuses: 'Define and manage asset lifecycle states',
        locations: 'Track physical locations of assets',
        users: 'Manage users who can be assigned assets',
        maintenance_logs: 'Track maintenance history and schedules'
      };

      return {
        tableName: table.name,
        component: 'HeaderWithActions',
        props: {
          title: displayName,
          subtitle: subtitles[table.name] || `Manage ${displayName.toLowerCase()}`,
          breadcrumbs,
          actions
        },
        code: `<HeaderWithActions
  title="${displayName}"
  subtitle="${subtitles[table.name] || `Manage ${displayName.toLowerCase()}`}"
  breadcrumbs={${JSON.stringify(breadcrumbs, null, 2)}}
  actions={[
    ${actions.map((_, i) => 
      i === 0 ? '<Button variant="contained" size="small">Add New</Button>' : 
      '<Button variant="outlined" size="small">Export</Button>'
    ).join(',\n    ')}
  ]}
/>`
      };
    });

    setGeneratedHeaders(headers);
  }, [dbml, parseDBML]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const saveSchema = () => {
    localStorage.setItem('dbml-schema', dbml);
  };

  const loadSchema = () => {
    const saved = localStorage.getItem('dbml-schema');
    if (saved) {
      setDBml(saved);
    }
  };

  React.useEffect(() => {
    // Load saved schema on mount
    const saved = localStorage.getItem('dbml-schema');
    if (saved) {
      setDBml(saved);
    }
  }, []);

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <SchemaIcon color="primary" />
              <Typography variant="h5">
                DBML Asset Management Generator
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<SaveIcon />}
                onClick={saveSchema}
              >
                Save Schema
              </Button>
              <Button
                variant="contained"
                startIcon={<GenerateIcon />}
                onClick={generatePatterns}
              >
                Generate Patterns
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            Edit the DBML schema below to define your asset management database structure. 
            The system will generate appropriate PageHeader patterns for each table.
          </Typography>

          <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
            <Tab label="Schema Editor" />
            <Tab label="Generated Headers" />
            <Tab label="Preview" />
          </Tabs>

          <Divider />

          {/* Schema Editor */}
          <TabPanel value={tabValue} index={0}>
            <TextField
              fullWidth
              multiline
              rows={20}
              value={dbml}
              onChange={(e) => setDBml(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
              placeholder="Enter your DBML schema here..."
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </TabPanel>

          {/* Generated Headers */}
          <TabPanel value={tabValue} index={1}>
            {generatedHeaders.length === 0 ? (
              <Alert severity="info">
                Click "Generate Patterns" to create PageHeader components from your schema
              </Alert>
            ) : (
              <Stack spacing={3}>
                {generatedHeaders.map((header, index) => (
                  <Paper key={index} sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6">
                          {header.props.title}
                        </Typography>
                        <Chip 
                          label={header.tableName} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Tooltip title="Copy Code">
                        <IconButton onClick={() => copyCode(header.code)}>
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'grey.900',
                        color: 'grey.100',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        overflow: 'auto'
                      }}
                    >
                      <pre style={{ margin: 0 }}>{header.code}</pre>
                    </Paper>
                  </Paper>
                ))}
              </Stack>
            )}
          </TabPanel>

          {/* Preview */}
          <TabPanel value={tabValue} index={2}>
            {generatedHeaders.length === 0 ? (
              <Alert severity="info">
                Generate patterns first to see previews
              </Alert>
            ) : (
              <Stack spacing={4}>
                {generatedHeaders.map((header, index) => (
                  <Box key={index}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      Preview: {header.tableName}
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <HeaderWithActions {...header.props} />
                    </Paper>
                  </Box>
                ))}
              </Stack>
            )}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};