interface ComponentSpec {
  type: string;
  elements: string[];
  dataTypes: string[];
  description: string;
}

interface ClaudeCodeResponse {
  component: {
    name: string;
    description: string;
    code: string;
    defaultProps: Record<string, any>;
    variations: Array<{
      id: string;
      name: string;
      props: Record<string, any>;
      description: string;
    }>;
  };
}

export class ClaudeCodeService {
  private apiUrl = 'http://localhost:3000/api/claude-code';

  async generateComponent(prompt: string): Promise<ClaudeCodeResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: this.formatPromptForClaude(prompt),
          type: 'component_generation'
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling Claude Code API:', error);
      throw error;
    }
  }

  private formatPromptForClaude(userPrompt: string): string {
    return `Generate a React component by COMPOSING ONLY existing Material-UI (MUI) components based on this description: "${userPrompt}"

STRICT REQUIREMENTS:
1. You MUST ONLY use existing MUI components - DO NOT create any custom components
2. Compose the UI by combining MUI components like Box, Card, Typography, Button, etc.
3. Use only MUI's sx prop or theme for styling - no custom CSS
4. Create a functional component that accepts props
5. Include 3-4 variations showing different states/configurations
6. The component should be a composition/arrangement of MUI components

Available MUI Components to use:
- Layout: Box, Container, Grid, Stack, Paper, Card, CardContent, CardActions, CardHeader
- Typography: Typography, Link
- Inputs: Button, IconButton, TextField, Checkbox, Switch, Radio, Select, Slider
- Data Display: List, ListItem, Table, Avatar, Badge, Chip, Tooltip, Divider
- Feedback: Alert, Snackbar, Dialog, CircularProgress, LinearProgress, Skeleton
- Navigation: Tabs, Tab, Breadcrumbs, Menu, MenuItem, Drawer, AppBar, Toolbar
- Surfaces: Accordion, Paper, Card
- Icons: Use any @mui/icons-material icons

DO NOT:
- Create custom styled components
- Use makeStyles, styled, or withStyles
- Create new component logic beyond composition
- Use any non-MUI components

Return the response in this exact JSON format:
{
  "component": {
    "name": "ComponentName",
    "description": "Brief description of the component",
    "code": "// Full TypeScript component code here",
    "defaultProps": {
      "prop1": "value1",
      "prop2": "value2"
    },
    "variations": [
      {
        "id": "var1",
        "name": "Default",
        "props": { "prop1": "value1" },
        "description": "Default state"
      },
      {
        "id": "var2", 
        "name": "Loading",
        "props": { "loading": true },
        "description": "Loading state"
      }
    ]
  }
}`;
  }

  // Mock response for testing when API is not available
  getMockResponse(prompt: string): ClaudeCodeResponse {
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('header')) {
      return {
        component: {
          name: 'PageHeader',
          description: 'A flexible page header component with title, actions, and breadcrumbs',
          code: `export const PageHeader = ({ title, subtitle, breadcrumbs, actions, onBack, status }) => {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs && (
        <Breadcrumbs sx={{ mb: 2 }}>
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              color="inherit"
              href={crumb.href}
              underline="hover"
              sx={{ cursor: crumb.href ? 'pointer' : 'default' }}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}
      
      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={2}>
          {onBack && (
            <IconButton onClick={onBack} edge="start">
              <ArrowBack />
            </IconButton>
          )}
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h4" component="h1">
                {title}
              </Typography>
              {status && (
                <Chip 
                  label={status} 
                  size="small"
                  color={
                    status === 'published' ? 'success' : 
                    status === 'draft' ? 'warning' : 
                    'default'
                  }
                />
              )}
            </Box>
            {subtitle && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        {actions && (
          <Box display="flex" gap={1}>
            <Button variant="outlined" size="small">Export</Button>
            <Button variant="contained" size="small">New Project</Button>
            <IconButton size="small"><MoreVert /></IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};`,
          defaultProps: {
            title: 'Page Title',
            subtitle: 'Page description goes here',
            breadcrumbs: [
              { label: 'Home', href: '/' },
              { label: 'Section', href: '/section' },
              { label: 'Current Page' }
            ]
          },
          variations: [
            {
              id: 'default',
              name: 'Default',
              props: {
                title: 'Dashboard',
                subtitle: 'Monitor your application metrics and performance'
              },
              description: 'Basic header with title and subtitle'
            },
            {
              id: 'with-breadcrumbs',
              name: 'With Breadcrumbs',
              props: {
                title: 'User Profile',
                subtitle: 'Manage user information and settings',
                breadcrumbs: [
                  { label: 'Home', href: '/' },
                  { label: 'Users', href: '/users' },
                  { label: 'John Doe' }
                ]
              },
              description: 'Header with navigation breadcrumbs'
            },
            {
              id: 'with-actions',
              name: 'With Actions',
              props: {
                title: 'Projects',
                subtitle: 'All your active projects',
                actions: 'actionsPlaceholder' // Will be replaced in the component
              },
              description: 'Header with action buttons'
            },
            {
              id: 'with-status',
              name: 'With Status',
              props: {
                title: 'Blog Post',
                subtitle: 'Last edited 2 hours ago',
                status: 'published',
                breadcrumbs: [
                  { label: 'Blog', href: '/blog' },
                  { label: 'Posts', href: '/blog/posts' },
                  { label: 'Current Post' }
                ]
              },
              description: 'Header with status indicator'
            }
          ]
        }
      };
    }

    // Default mock response for other component types
    return {
      component: {
        name: 'GeneratedComponent',
        description: 'Component generated based on your description',
        code: `export const GeneratedComponent = ({ title = 'Generated Component' }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Component will be generated based on: "${prompt}"
        </Typography>
        <Box mt={2}>
          <Button variant="contained" color="primary">
            Action Button
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};`,
        defaultProps: {
          title: 'Generated Component'
        },
        variations: [
          {
            id: 'default',
            name: 'Default',
            props: { title: 'Default Component' },
            description: 'Default state'
          },
          {
            id: 'alternate',
            name: 'Alternate',
            props: { title: 'Alternate Version' },
            description: 'Alternate styling'
          }
        ]
      }
    };
  }
}

export const claudeCodeService = new ClaudeCodeService();