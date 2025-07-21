import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
} from '@mui/material';
import {
  Schema as SchemaIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  TableChart as TableIcon,
  AccountTree as DiagramIcon,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { Parser, exporter } from '@dbml/core';

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

// Default DBML schema for the project
const defaultDBML = `// Momentum Project Database Schema
// This schema represents the data structure for the Momentum browser development integration

Project momentum {
  database_type: 'PostgreSQL'
  Note: 'Main database schema for Momentum project'
}

Table components {
  id int [pk, increment]
  name varchar [not null, unique]
  category varchar [not null]
  description text
  status component_status [not null, default: 'pending']
  code text [not null]
  props_schema json
  created_at timestamp [default: 'now()']
  updated_at timestamp
  created_by int [ref: > users.id]
  
  Indexes {
    (category, status) [name: 'idx_component_category_status']
    created_at [name: 'idx_component_created']
  }
  
  Note: 'Stores React component patterns and templates'
}

Table component_reviews {
  id int [pk, increment]
  component_id int [ref: > components.id, not null]
  reviewer_id int [ref: > users.id, not null]
  status review_status [not null]
  feedback text
  reviewed_at timestamp [default: 'now()']
  
  Indexes {
    component_id [name: 'idx_review_component']
    (reviewer_id, status) [name: 'idx_review_user_status']
  }
}

Table themes {
  id int [pk, increment]
  name varchar [not null, unique]
  description text
  config json [not null]
  is_active boolean [default: false]
  created_at timestamp [default: 'now()']
  updated_at timestamp
  created_by int [ref: > users.id]
  
  Note: 'Material-UI theme configurations'
}

Table github_connections {
  id int [pk, increment]
  user_id int [ref: > users.id, not null]
  github_username varchar [not null]
  access_token varchar [not null]
  webhook_secret varchar
  connected_at timestamp [default: 'now()']
  last_sync timestamp
  
  Indexes {
    user_id [unique, name: 'idx_github_user']
  }
}

Table ai_interactions {
  id int [pk, increment]
  user_id int [ref: > users.id]
  component_id int [ref: > components.id]
  interaction_type varchar [not null]
  prompt text [not null]
  response text
  model_used varchar
  tokens_used int
  created_at timestamp [default: 'now()']
  
  Indexes {
    (user_id, created_at) [name: 'idx_ai_user_time']
  }
}

Table users {
  id int [pk, increment]
  email varchar [unique, not null]
  name varchar [not null]
  role user_role [not null, default: 'developer']
  preferences json
  created_at timestamp [default: 'now()']
  last_active timestamp
}

Table performance_metrics {
  id int [pk, increment]
  metric_type varchar [not null]
  value decimal [not null]
  metadata json
  recorded_at timestamp [default: 'now()']
  
  Indexes {
    (metric_type, recorded_at) [name: 'idx_metric_type_time']
  }
}

// Enums
Enum component_status {
  pending
  approved
  rejected
  production
}

Enum review_status {
  approved
  rejected
  needs_changes
  in_review
}

Enum user_role {
  admin
  developer
  reviewer
  viewer
}

// Table relationships documented
Ref: component_reviews.component_id > components.id [delete: cascade]
Ref: component_reviews.reviewer_id > users.id
Ref: themes.created_by > users.id
Ref: components.created_by > users.id
Ref: github_connections.user_id - users.id
Ref: ai_interactions.user_id > users.id
Ref: ai_interactions.component_id > components.id`;

interface ParsedSchema {
  tables: any[];
  refs: any[];
  enums: any[];
  project?: any;
  errors?: any[];
}

export const DBMLEditor: React.FC = () => {
  const [dbml, setDBml] = useState(defaultDBML);
  const [tabValue, setTabValue] = useState(0);
  const [parsedSchema, setParsedSchema] = useState<ParsedSchema | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'postgres' | 'mysql' | 'mssql'>('postgres');
  const [exportedSQL, setExportedSQL] = useState<string>('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [syntaxReferenceOpen, setSyntaxReferenceOpen] = useState(false);

  // Parse DBML schema
  const parseDBML = useCallback((schema: string) => {
    try {
      const parsed = Parser.parse(schema, 'dbml');
      setParsedSchema(parsed);
      setParseError(null);
      return parsed;
    } catch (error: any) {
      setParseError(error.message || 'Failed to parse DBML schema');
      setParsedSchema(null);
      return null;
    }
  }, []);

  // Auto-parse on change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      parseDBML(dbml);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [dbml, parseDBML]);

  // Export to SQL
  const exportToSQL = useCallback(() => {
    const parsed = parseDBML(dbml);
    if (!parsed) return;

    try {
      const sql = exporter.export(parsed, exportFormat);
      setExportedSQL(sql);
      setShowExportDialog(true);
    } catch (error: any) {
      setSnackbarMessage(`Export error: ${error.message}`);
    }
  }, [dbml, exportFormat, parseDBML]);

  // Save/Load functions
  const saveSchema = () => {
    localStorage.setItem('momentum-dbml-schema', dbml);
    setSnackbarMessage('Schema saved to browser storage');
  };

  const loadSchema = () => {
    const saved = localStorage.getItem('momentum-dbml-schema');
    if (saved) {
      setDBml(saved);
      setSnackbarMessage('Schema loaded from browser storage');
    }
  };

  const downloadSchema = () => {
    const blob = new Blob([dbml], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'momentum-schema.dbml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSchema = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setDBml(content);
        setSnackbarMessage('Schema imported successfully');
      };
      reader.readAsText(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage('Copied to clipboard');
  };

  // Load saved schema on mount
  useEffect(() => {
    const saved = localStorage.getItem('momentum-dbml-schema');
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
                DBML Schema Editor
              </Typography>
              {parseError ? (
                <Chip
                  icon={<ErrorIcon />}
                  label="Invalid Schema"
                  color="error"
                  size="small"
                />
              ) : parsedSchema ? (
                <Chip
                  icon={<CheckIcon />}
                  label="Valid Schema"
                  color="success"
                  size="small"
                />
              ) : null}
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Upload DBML file">
                <IconButton component="label">
                  <UploadIcon />
                  <input
                    type="file"
                    hidden
                    accept=".dbml,.txt"
                    onChange={importSchema}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download DBML">
                <IconButton onClick={downloadSchema}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                size="small"
                startIcon={<SaveIcon />}
                onClick={saveSchema}
              >
                Save
              </Button>
              <Button
                variant="contained"
                startIcon={<CodeIcon />}
                onClick={exportToSQL}
                disabled={!parsedSchema}
              >
                Export SQL
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            Edit your database schema using DBML (Database Markup Language). 
            The editor provides syntax highlighting, validation, and SQL export capabilities.
          </Typography>

          <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
            <Tab label="Schema Editor" icon={<CodeIcon />} iconPosition="start" />
            <Tab label="Schema Overview" icon={<TableIcon />} iconPosition="start" />
            <Tab label="Visual Diagram" icon={<DiagramIcon />} iconPosition="start" />
          </Tabs>

          <Divider />

          {/* Schema Editor */}
          <TabPanel value={tabValue} index={0}>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  size="small"
                  startIcon={<InfoIcon />}
                  onClick={() => setSyntaxReferenceOpen(true)}
                >
                  DBML Syntax Reference
                </Button>
              </Box>
              
              <Paper variant="outlined" sx={{ height: 600, overflow: 'hidden' }}>
                <Editor
                  height="100%"
                  defaultLanguage="sql"
                  value={dbml}
                  onChange={(value) => setDBml(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </Paper>

              {parseError && (
                <Alert severity="error" icon={<ErrorIcon />}>
                  <strong>Parse Error:</strong> {parseError}
                </Alert>
              )}
            </Stack>
          </TabPanel>

          {/* Schema Overview */}
          <TabPanel value={tabValue} index={1}>
            {parsedSchema ? (
              <Grid container spacing={3}>
                {/* Tables */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Tables ({parsedSchema.tables.length})
                  </Typography>
                  <Stack spacing={2}>
                    {parsedSchema.tables.map((table) => (
                      <Paper key={table.name} sx={{ p: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <TableIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle1" fontWeight="bold">
                            {table.name}
                          </Typography>
                        </Box>
                        {table.note && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {table.note}
                          </Typography>
                        )}
                        <Box sx={{ pl: 2 }}>
                          {table.fields.map((field: any) => (
                            <Typography key={field.name} variant="body2" sx={{ py: 0.5 }}>
                              <strong>{field.name}</strong>: {field.type.type_name}
                              {field.pk && <Chip label="PK" size="small" sx={{ ml: 1 }} />}
                              {field.not_null && <Chip label="NOT NULL" size="small" sx={{ ml: 1 }} />}
                              {field.unique && <Chip label="UNIQUE" size="small" sx={{ ml: 1 }} />}
                            </Typography>
                          ))}
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Grid>

                {/* Enums and Relationships */}
                <Grid item xs={12} md={6}>
                  {/* Enums */}
                  {parsedSchema.enums.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Enums ({parsedSchema.enums.length})
                      </Typography>
                      <Stack spacing={2} sx={{ mb: 3 }}>
                        {parsedSchema.enums.map((enumType) => (
                          <Paper key={enumType.name} sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              {enumType.name}
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                              {enumType.values.map((value: any) => (
                                <Chip
                                  key={value.name}
                                  label={value.name}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Paper>
                        ))}
                      </Stack>
                    </>
                  )}

                  {/* Relationships */}
                  {parsedSchema.refs.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Relationships ({parsedSchema.refs.length})
                      </Typography>
                      <Stack spacing={1}>
                        {parsedSchema.refs.map((ref: any, index: number) => (
                          <Paper key={index} sx={{ p: 1.5 }}>
                            <Typography variant="body2">
                              <strong>{ref.endpoints[0].tableName}.{ref.endpoints[0].fieldNames[0]}</strong>
                              {' → '}
                              <strong>{ref.endpoints[1].tableName}.{ref.endpoints[1].fieldNames[0]}</strong>
                              {ref.onDelete && (
                                <Chip
                                  label={`ON DELETE ${ref.onDelete}`}
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </>
                  )}
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                Enter valid DBML in the editor to see schema overview
              </Alert>
            )}
          </TabPanel>

          {/* Visual Diagram */}
          <TabPanel value={tabValue} index={2}>
            <Alert severity="info" icon={<InfoIcon />}>
              <Typography variant="body2">
                To visualize your schema as an interactive diagram:
              </Typography>
              <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>Copy your DBML schema from the editor</li>
                <li>Visit <a href="https://dbdiagram.io/d" target="_blank" rel="noopener noreferrer">dbdiagram.io</a></li>
                <li>Paste your schema and click "Generate Diagram"</li>
              </ol>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={() => copyToClipboard(dbml)}
                sx={{ mt: 2 }}
              >
                Copy Schema
              </Button>
            </Alert>

            {parsedSchema && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Schema Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {parsedSchema.tables.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tables
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {parsedSchema.tables.reduce((acc, table) => acc + table.fields.length, 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fields
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {parsedSchema.refs.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Relationships
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {parsedSchema.enums.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enums
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Export SQL Dialog */}
      <Dialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Export to SQL</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Database Type</InputLabel>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              label="Database Type"
            >
              <MenuItem value="postgres">PostgreSQL</MenuItem>
              <MenuItem value="mysql">MySQL</MenuItem>
              <MenuItem value="mssql">SQL Server</MenuItem>
            </Select>
          </FormControl>
          
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.900' }}>
            <pre style={{ 
              margin: 0, 
              color: '#fff', 
              fontSize: '0.875rem',
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              {exportedSQL}
            </pre>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<CopyIcon />}
            onClick={() => copyToClipboard(exportedSQL)}
          >
            Copy SQL
          </Button>
        </DialogActions>
      </Dialog>

      {/* DBML Syntax Reference Dialog */}
      <Dialog
        open={syntaxReferenceOpen}
        onClose={() => setSyntaxReferenceOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>DBML Syntax Reference</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Basic Table Definition
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.100' }}>
            <pre style={{ margin: 0, fontSize: '0.875rem' }}>{`Table table_name {
  id int [pk, increment] // primary key
  name varchar [not null, unique]
  created_at timestamp [default: 'now()']
  
  Note: 'Table description'
}`}</pre>
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Field Types & Constraints
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.100' }}>
            <pre style={{ margin: 0, fontSize: '0.875rem' }}>{`// Common types: int, varchar, text, boolean, timestamp, json, decimal
// Constraints: pk, unique, not null, default: 'value'

email varchar [unique, not null]
status varchar [default: 'active']
price decimal(10,2) [not null]`}</pre>
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Relationships
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.100' }}>
            <pre style={{ margin: 0, fontSize: '0.875rem' }}>{`// Many-to-one
Ref: posts.user_id > users.id

// One-to-one
Ref: users.profile_id - profiles.id

// Many-to-many (use junction table)
Ref: user_roles.user_id > users.id
Ref: user_roles.role_id > roles.id

// With cascade
Ref: orders.user_id > users.id [delete: cascade]`}</pre>
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Enums & Indexes
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.100' }}>
            <pre style={{ margin: 0, fontSize: '0.875rem' }}>{`Enum status {
  active
  inactive
  pending
}

Table users {
  id int [pk]
  email varchar
  status status [not null]
  
  Indexes {
    email [unique]
    (status, created_at) [name: 'idx_status_time']
  }
}`}</pre>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyntaxReferenceOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />
    </Box>
  );
};