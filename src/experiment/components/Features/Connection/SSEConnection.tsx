import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  Stack,
  Alert,
  Grid,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { SSEMessage } from '../../../types/api.types';

interface Message {
  text: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  time: string;
}

export const SSEConnection: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('http://localhost:3000/events');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnected(true);
      addMessage('Connected to SSE server', 'success');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SSEMessage;
        addMessage(`Received: ${JSON.stringify(data)}`, 'info');
      } catch (error) {
        addMessage(`Received: ${event.data}`, 'info');
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      addMessage('Connection lost', 'error');
    };
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setConnected(false);
      addMessage('Disconnected', 'info');
    }
  };

  const addMessage = (text: string, severity: Message['severity']) => {
    setMessages(prev => [...prev, { text, severity, time: new Date().toLocaleTimeString() }]);
  };

  React.useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h5" component="h2">
                  SSE Connection
                </Typography>
                <Chip
                  icon={connected ? <CheckCircleIcon /> : <CancelIcon />}
                  label={connected ? 'Connected' : 'Disconnected'}
                  color={connected ? 'success' : 'error'}
                />
              </Box>
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  onClick={connectSSE}
                  disabled={connected}
                  startIcon={<CloudUploadIcon />}
                >
                  Connect
                </Button>
                <Button
                  variant="outlined"
                  onClick={disconnect}
                  disabled={!connected}
                  startIcon={<CloudDownloadIcon />}
                >
                  Disconnect
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Message Log
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  maxHeight: 300, 
                  overflow: 'auto', 
                  p: 2,
                  bgcolor: 'background.default'
                }}
              >
                {messages.length === 0 ? (
                  <Typography color="text.secondary">No messages yet...</Typography>
                ) : (
                  <Stack spacing={1}>
                    {messages.map((msg, index) => (
                      <Alert key={index} severity={msg.severity} sx={{ fontSize: '0.875rem' }}>
                        <Box display="flex" justifyContent="space-between">
                          <span>{msg.text}</span>
                          <Typography variant="caption" color="text.secondary">
                            {msg.time}
                          </Typography>
                        </Box>
                      </Alert>
                    ))}
                  </Stack>
                )}
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};