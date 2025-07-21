import OpenAI from 'openai';

class ClaudeCodeHandler {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async handleComponentGeneration(prompt) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a React component generator that ONLY composes existing Material-UI components.
            
STRICT RULES:
1. You MUST ONLY use existing MUI components - DO NOT create any custom components
2. Compose the UI by combining MUI components (Box, Card, Typography, Button, etc.)
3. Use only MUI's sx prop for styling - no custom CSS
4. Create functional components without TypeScript (pure JavaScript)
5. Include 3-4 variations showing different states
6. Return ONLY valid JSON in the exact format specified

Available MUI Components:
- Layout: Box, Container, Grid, Stack, Paper, Card, CardContent, CardActions
- Typography: Typography, Link
- Inputs: Button, IconButton, TextField, Checkbox, Switch, Select
- Data Display: List, ListItem, Avatar, Badge, Chip, Tooltip, Divider
- Feedback: Alert, CircularProgress, Skeleton
- Icons: Any from @mui/icons-material

DO NOT create new components - only compose existing MUI components.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content);
      return response;
    } catch (error) {
      console.error('Error generating component:', error);
      
      // Return a fallback response
      return this.getFallbackResponse(prompt);
    }
  }

  getFallbackResponse(prompt) {
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('card') && promptLower.includes('user')) {
      return {
        component: {
          name: "UserCard",
          description: "A user profile card with avatar and details",
          code: `export const UserCard = ({
  name,
  role,
  email,
  phone,
  avatar,
  status = 'active',
  onMenuClick
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" gap={2}>
            <Avatar 
              src={avatar} 
              alt={name}
              sx={{ width: 56, height: 56 }}
            >
              {name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{name}</Typography>
              <Typography variant="body2" color="text.secondary">{role}</Typography>
              <Chip 
                label={status} 
                size="small" 
                color={getStatusColor()}
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>
          {onMenuClick && (
            <IconButton size="small" onClick={onMenuClick}>
              <MoreVert />
            </IconButton>
          )}
        </Box>
        
        <Box mt={3} display="flex" flexDirection="column" gap={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Email fontSize="small" color="action" />
            <Typography variant="body2">{email}</Typography>
          </Box>
          {phone && (
            <Box display="flex" alignItems="center" gap={1}>
              <Phone fontSize="small" color="action" />
              <Typography variant="body2">{phone}</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};`,
          defaultProps: {
            name: "John Doe",
            role: "Software Engineer",
            email: "john.doe@example.com",
            status: "active"
          },
          variations: [
            {
              id: "default",
              name: "Default",
              props: {
                name: "John Doe",
                role: "Software Engineer",
                email: "john.doe@example.com",
                status: "active"
              },
              description: "Active user with basic info"
            },
            {
              id: "with-avatar",
              name: "With Avatar",
              props: {
                name: "Jane Smith",
                role: "Product Manager",
                email: "jane.smith@example.com",
                avatar: "https://mui.com/static/images/avatar/2.jpg",
                phone: "+1 234 567 8900",
                status: "active"
              },
              description: "User with avatar and phone"
            },
            {
              id: "inactive",
              name: "Inactive User",
              props: {
                name: "Bob Johnson",
                role: "Designer",
                email: "bob.j@example.com",
                status: "inactive"
              },
              description: "Inactive user status"
            },
            {
              id: "pending",
              name: "Pending User",
              props: {
                name: "Alice Cooper",
                role: "Marketing Lead",
                email: "alice.c@example.com",
                status: "pending",
                onMenuClick: () => console.log('Menu clicked')
              },
              description: "Pending user with menu action"
            }
          ]
        }
      };
    }

    // Generic fallback
    return {
      component: {
        name: "GeneratedComponent",
        description: "AI-generated component based on your description",
        code: `import React from 'react';\nimport { Box, Typography, Paper } from '@mui/material';\n\nexport const GeneratedComponent = () => {\n  return (\n    <Paper sx={{ p: 3 }}>\n      <Typography variant="h6">Generated Component</Typography>\n      <Typography variant="body2" color="text.secondary">\n        Component will be generated based on: "${prompt}"\n      </Typography>\n    </Paper>\n  );\n};`,
        defaultProps: {},
        variations: [
          {
            id: "default",
            name: "Default",
            props: {},
            description: "Default state"
          }
        ]
      }
    };
  }
}

export default ClaudeCodeHandler;