import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Stack,
  Alert,
  Chip,
  IconButton,
  Link,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Code as CodeIcon,
  Palette as PaletteIcon,
  Storage as StorageIcon,
  CheckCircle as CheckIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    label: 'Start Development Server',
    description: 'Get the experiment lab up and running',
    command: 'npm run dev:experiment',
    completed: true, // Already running if they see this
  },
  {
    label: 'Explore Component Generator',
    description: 'Generate UI components with AI assistance',
    action: '/component-generator',
  },
  {
    label: 'Review Generated Patterns',
    description: 'Approve or reject generated components',
    action: '/component-generator',
  },
  {
    label: 'Create Review Branch',
    description: 'Prepare patterns for team review',
    command: 'npm run create:pattern-branch "feature/my-components"',
  },
  {
    label: 'Submit for Review',
    description: 'Create pull request for approval',
    command: 'npm run submit:patterns',
  },
];

const quickCommands = [
  { label: 'Start Experiment Lab', command: 'npm run dev:experiment', icon: <PlayIcon /> },
  { label: 'Generate Components', action: '/component-generator', icon: <CodeIcon /> },
  { label: 'Edit Theme', action: '/theme-editor', icon: <PaletteIcon /> },
  { label: 'Design Schema', action: '/dbml-editor', icon: <StorageIcon /> },
];

export const Onboarding: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(text);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const handleAction = (action: string) => {
    navigate(action);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to Momentum Experimentation Lab! 🚀
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Let's get you started with generating and reviewing UI patterns.
      </Typography>

      <Stack spacing={3}>
        {/* Quick Actions */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              {quickCommands.map((cmd) => (
                <Button
                  key={cmd.label}
                  variant="outlined"
                  startIcon={cmd.icon}
                  onClick={() => cmd.action ? handleAction(cmd.action) : copyToClipboard(cmd.command!)}
                  sx={{ mb: 1 }}
                >
                  {cmd.label}
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Getting Started Steps */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Getting Started Workflow
            </Typography>
            
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    optional={
                      index === steps.length - 1 ? (
                        <Typography variant="caption">Final step</Typography>
                      ) : null
                    }
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                    
                    {step.command && (
                      <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography
                            variant="body2"
                            component="code"
                            sx={{ fontFamily: 'monospace', flex: 1 }}
                          >
                            {step.command}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(step.command!)}
                          >
                            {copiedCommand === step.command ? <CheckIcon /> : <CopyIcon />}
                          </IconButton>
                        </Stack>
                      </Paper>
                    )}
                    
                    {step.action && (
                      <Button
                        variant="contained"
                        onClick={() => handleAction(step.action!)}
                        sx={{ mt: 2 }}
                        endIcon={<OpenIcon />}
                      >
                        Open {step.label}
                      </Button>
                    )}
                    
                    <Box sx={{ mb: 2, mt: 2 }}>
                      {index < steps.length - 1 && (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mr: 1 }}
                        >
                          Continue
                        </Button>
                      )}
                      {index > 0 && (
                        <Button onClick={handleBack}>
                          Back
                        </Button>
                      )}
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            
            {activeStep === steps.length && (
              <Paper square elevation={0} sx={{ p: 3 }}>
                <Typography>All steps completed - you're ready to go! 🎉</Typography>
                <Button onClick={handleReset} sx={{ mt: 1 }}>
                  Reset
                </Button>
              </Paper>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pro Tips 💡
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Be specific when generating components"
                  secondary='Instead of "create a card", try "create a metric card with trend indicator"'
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Generate multiple variations"
                  secondary="The AI will create 3-5 variations for you to choose from"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Use the review queue"
                  secondary="Approve/reject components with feedback for better results"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resources
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="text"
                startIcon={<GitHubIcon />}
                href="https://github.com/barnesy/momentum"
                target="_blank"
              >
                GitHub Repo
              </Button>
              <Button
                variant="text"
                startIcon={<OpenIcon />}
                href="https://mui.com/material-ui/getting-started/"
                target="_blank"
              >
                Material-UI Docs
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};