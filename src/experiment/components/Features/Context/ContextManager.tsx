import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { ContextUpdate } from '../../../types/api.types';

interface QuickAction {
  label: string;
  context: string;
}

const quickActions: QuickAction[] = [
  { label: 'Code Review', context: 'Review this code for best practices' },
  { label: 'Bug Fix', context: 'Help me fix this bug' },
  { label: 'Refactor', context: 'Suggest refactoring improvements' },
  { label: 'Documentation', context: 'Generate documentation for this code' },
];

export const ContextManager: React.FC = () => {
  const [contextText, setContextText] = useState('');
  const [sending, setSending] = useState(false);

  const sendContext = async () => {
    if (!contextText.trim()) return;

    setSending(true);
    try {
      const contextUpdate: ContextUpdate = {
        source: 'experiment-page',
        content: contextText,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('http://localhost:3000/context/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contextUpdate),
      });
      
      if (response.ok) {
        setContextText('');
      }
    } catch (error) {
      console.error('Failed to send context:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      sendContext();
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Send Context
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                placeholder="Enter context information..."
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{ mb: 2 }}
              />
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  onClick={sendContext}
                  disabled={!contextText || sending}
                  startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
                >
                  {sending ? 'Sending...' : 'Send Context'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setContextText('')}
                  disabled={!contextText || sending}
                >
                  Clear
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Tip: Press Ctrl+Enter to send
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={1}>
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    fullWidth
                    onClick={() => setContextText(action.context)}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};