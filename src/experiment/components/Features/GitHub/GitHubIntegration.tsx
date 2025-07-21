import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Grid,
} from '@mui/material';
import { GitHub as GitHubIcon } from '@mui/icons-material';

export const GitHubIntegration: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [webhookStatus, setWebhookStatus] = useState<'inactive' | 'active'>('inactive');

  const connectRepository = () => {
    // Placeholder for GitHub connection logic
    console.log('Connecting to:', repoUrl);
    setWebhookStatus('active');
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                GitHub Integration
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <GitHubIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body1">
                    Connect your GitHub repository to enable webhook integration
                  </Typography>
                  <Chip
                    size="small"
                    label={`Webhook: ${webhookStatus}`}
                    color={webhookStatus === 'active' ? 'success' : 'default'}
                  />
                </Box>
              </Box>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                sx={{ mb: 2 }}
                label="Repository URL"
              />
              <Button
                variant="contained"
                startIcon={<GitHubIcon />}
                disabled={!repoUrl}
                onClick={connectRepository}
              >
                Connect Repository
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};