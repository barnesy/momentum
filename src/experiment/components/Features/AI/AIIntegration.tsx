import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Psychology as PsychologyIcon } from '@mui/icons-material';

export const AIIntegration: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const sendPrompt = async () => {
    setLoading(true);
    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResponse('AI response would appear here. This is a placeholder for the actual AI integration.');
      setPrompt('');
    } catch (error) {
      console.error('Failed to send prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                AI Assistant
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Ask the AI assistant..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={sendPrompt}
                disabled={!prompt || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <PsychologyIcon />}
              >
                {loading ? 'Processing...' : 'Send to AI'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        {response && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Response
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography>{response}</Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};