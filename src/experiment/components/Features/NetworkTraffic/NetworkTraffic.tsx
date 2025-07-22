import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
  Collapse,
  Badge,
} from '@mui/material';
import {
  Stream as StreamIcon,
  Refresh as RefreshIcon,
  Circle as StatusIcon,
  ArrowUpward,
  ArrowDownward,
  AccessTime,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  PlayArrow,
  Stop,
  Clear,
  Search,
  ExpandMore,
  ExpandLess,
  Speed,
  DataUsage,
  Timeline,
  FilterList,
} from '@mui/icons-material';

interface SSEConnection {
  id: string;
  url: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  readyState: number;
  connectedAt?: Date;
  disconnectedAt?: Date;
  lastMessageAt?: Date;
  messagesReceived: number;
  bytesReceived: number;
  reconnectAttempts: number;
  error?: string;
  eventTypes: Map<string, number>;
  latency: number[];
  eventSource?: EventSource;
  totalUptime: number; // Total uptime in seconds across all connections
}

interface SSEMessage {
  id: string;
  connectionId: string;
  timestamp: Date;
  type: string;
  data: any;
  size: number;
  latency?: number;
}

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  totalMessages: number;
  totalBytes: number;
  averageLatency: number;
  uptime: number;
  errorRate: number;
}

export const NetworkTraffic: React.FC = () => {
  const [connections, setConnections] = useState<Map<string, SSEConnection>>(new Map());
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    totalConnections: 0,
    activeConnections: 0,
    totalMessages: 0,
    totalBytes: 0,
    averageLatency: 0,
    uptime: 0,
    errorRate: 0,
  });
  
  const [autoScroll, setAutoScroll] = useState(true);
  const [showRawData, setShowRawData] = useState(false);
  const [filterEventType, setFilterEventType] = useState('');
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<Date>(new Date());
  const metricsIntervalRef = useRef<NodeJS.Timeout>();

  // Predefined SSE endpoints to monitor
  const SSE_ENDPOINTS = [
    { id: 'main', url: 'http://localhost:3000/events', name: 'Main SSE' },
    { id: 'monitor', url: 'http://localhost:3000/api/network-monitor', name: 'Network Monitor' },
  ];

  // Connect to SSE endpoint
  const connectToSSE = useCallback((endpoint: typeof SSE_ENDPOINTS[0]) => {
    if (connections.has(endpoint.id)) {
      const existing = connections.get(endpoint.id);
      if (existing?.eventSource) {
        existing.eventSource.close();
      }
    }

    const existingConnection = connections.get(endpoint.id);
    const connection: SSEConnection = {
      id: endpoint.id,
      url: endpoint.url,
      status: 'connecting',
      readyState: 0,
      messagesReceived: existingConnection?.messagesReceived || 0,
      bytesReceived: existingConnection?.bytesReceived || 0,
      reconnectAttempts: existingConnection?.reconnectAttempts || 0,
      eventTypes: existingConnection?.eventTypes || new Map(),
      latency: existingConnection?.latency || [],
      totalUptime: existingConnection?.totalUptime || 0,
    };

    const eventSource = new EventSource(endpoint.url);
    connection.eventSource = eventSource;

    eventSource.onopen = () => {
      connection.status = 'connected';
      connection.readyState = eventSource.readyState;
      connection.connectedAt = new Date();
      connection.reconnectAttempts = 0;
      setConnections(new Map(connections.set(endpoint.id, connection)));
    };

    eventSource.onerror = (error) => {
      connection.status = 'error';
      connection.readyState = eventSource.readyState;
      
      // More detailed error message
      if (eventSource.readyState === EventSource.CONNECTING) {
        connection.error = `Connecting to ${endpoint.url}...`;
      } else if (eventSource.readyState === EventSource.CLOSED) {
        connection.error = `Failed to connect to ${endpoint.url} - Server may be offline`;
      } else {
        connection.error = 'Connection error';
      }
      
      connection.reconnectAttempts++;
      setConnections(new Map(connections.set(endpoint.id, connection)));
    };

    eventSource.onmessage = (event) => {
      if (isPaused) return;
      
      const messageSize = new TextEncoder().encode(event.data).length;
      const now = new Date();
      
      connection.messagesReceived++;
      connection.bytesReceived += messageSize;
      connection.lastMessageAt = now;
      connection.readyState = eventSource.readyState;
      
      // Track event types
      const eventType = event.type || 'message';
      connection.eventTypes.set(eventType, (connection.eventTypes.get(eventType) || 0) + 1);
      
      // Calculate latency (if timestamp in data)
      let latency: number | undefined;
      try {
        const data = JSON.parse(event.data);
        if (data.timestamp) {
          latency = now.getTime() - data.timestamp;
          connection.latency.push(latency);
          if (connection.latency.length > 100) {
            connection.latency.shift();
          }
        }
      } catch {}
      
      const message: SSEMessage = {
        id: `${endpoint.id}-${Date.now()}-${Math.random()}`,
        connectionId: endpoint.id,
        timestamp: now,
        type: eventType,
        data: event.data,
        size: messageSize,
        latency,
      };
      
      setMessages(prev => [...prev.slice(-999), message]);
      setConnections(new Map(connections.set(endpoint.id, connection)));
    };

    // Add custom event listeners
    ['github-event', 'server-log', 'sse-update', 'error', 'context-update'].forEach(eventType => {
      eventSource.addEventListener(eventType, (event: MessageEvent) => {
        if (isPaused) return;
        
        const messageSize = new TextEncoder().encode(event.data).length;
        const now = new Date();
        
        connection.messagesReceived++;
        connection.bytesReceived += messageSize;
        connection.lastMessageAt = now;
        
        connection.eventTypes.set(eventType, (connection.eventTypes.get(eventType) || 0) + 1);
        
        const message: SSEMessage = {
          id: `${endpoint.id}-${Date.now()}-${Math.random()}`,
          connectionId: endpoint.id,
          timestamp: now,
          type: eventType,
          data: event.data,
          size: messageSize,
        };
        
        setMessages(prev => [...prev.slice(-999), message]);
        setConnections(new Map(connections.set(endpoint.id, connection)));
      });
    });

    setConnections(new Map(connections.set(endpoint.id, connection)));
  }, [connections, isPaused]);

  // Disconnect from SSE
  const disconnectSSE = useCallback((connectionId: string) => {
    const connection = connections.get(connectionId);
    if (connection?.eventSource) {
      connection.eventSource.close();
      connection.status = 'disconnected';
      connection.readyState = 2;
      connection.disconnectedAt = new Date();
      
      // Calculate uptime for this session if it was connected
      if (connection.connectedAt) {
        const sessionUptime = Math.floor((connection.disconnectedAt.getTime() - connection.connectedAt.getTime()) / 1000);
        connection.totalUptime += sessionUptime;
      }
      
      setConnections(new Map(connections.set(connectionId, connection)));
    }
  }, [connections]);

  // Connect to all endpoints on mount
  useEffect(() => {
    SSE_ENDPOINTS.forEach(endpoint => {
      connectToSSE(endpoint);
    });

    // Update metrics every second
    metricsIntervalRef.current = setInterval(() => {
      const now = new Date();
      
      let totalMessages = 0;
      let totalBytes = 0;
      let activeConnections = 0;
      let totalLatency = 0;
      let latencyCount = 0;
      let errors = 0;
      let longestUptime = 0;
      
      connections.forEach(conn => {
        totalMessages += conn.messagesReceived;
        totalBytes += conn.bytesReceived;
        if (conn.status === 'connected') {
          activeConnections++;
          // Calculate current session uptime for connected connections
          if (conn.connectedAt) {
            const currentSessionUptime = Math.floor((now.getTime() - conn.connectedAt.getTime()) / 1000);
            const totalConnectionUptime = conn.totalUptime + currentSessionUptime;
            longestUptime = Math.max(longestUptime, totalConnectionUptime);
          }
        } else {
          // For disconnected connections, use the stored total uptime
          longestUptime = Math.max(longestUptime, conn.totalUptime);
        }
        
        if (conn.status === 'error') errors++;
        
        conn.latency.forEach(l => {
          totalLatency += l;
          latencyCount++;
        });
      });
      
      setMetrics({
        totalConnections: connections.size,
        activeConnections,
        totalMessages,
        totalBytes,
        averageLatency: latencyCount > 0 ? totalLatency / latencyCount : 0,
        uptime: longestUptime, // Use the longest connection uptime
        errorRate: connections.size > 0 ? (errors / connections.size) * 100 : 0,
      });
    }, 1000);

    return () => {
      connections.forEach(conn => {
        if (conn.eventSource) {
          conn.eventSource.close();
        }
      });
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const getStatusIcon = (status: SSEConnection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle color="success" />;
      case 'connecting':
        return <StatusIcon color="info" className="pulse" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'disconnected':
        return <StatusIcon color="disabled" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const toggleConnectionExpanded = (id: string) => {
    const newExpanded = new Set(expandedConnections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedConnections(newExpanded);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const filteredMessages = filterEventType
    ? messages.filter(m => m.type.toLowerCase().includes(filterEventType.toLowerCase()))
    : messages;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          SSE Monitoring
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControlLabel
            control={<Switch checked={!isPaused} onChange={(e) => setIsPaused(!e.target.checked)} />}
            label="Live"
          />
          <FormControlLabel
            control={<Switch checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} />}
            label="Auto-scroll"
          />
          <Button
            startIcon={<Clear />}
            onClick={clearMessages}
            size="small"
            variant="outlined"
          >
            Clear
          </Button>
        </Stack>
      </Box>

      {/* Server Status Alert */}
      {metrics.activeConnections === 0 && connections.size > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="body2" gutterBottom>
              <strong>SSE Server Offline</strong> - No active connections detected
            </Typography>
            <Typography variant="caption" component="div">
              Start the SSE server: <code>cd github-app && npm start</code>
            </Typography>
            <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
              Expected endpoints:
              <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                <li>Main SSE: http://localhost:3000/events</li>
                <li>Network Monitor: http://localhost:3000/api/network-monitor</li>
              </ul>
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Metrics Overview */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <StreamIcon color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Connections
                  </Typography>
                  <Typography variant="h6">
                    {metrics.activeConnections}/{metrics.totalConnections}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Badge badgeContent={filteredMessages.length} color="primary" max={999}>
                  <DataUsage color="action" />
                </Badge>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Messages
                  </Typography>
                  <Typography variant="h6">
                    {metrics.totalMessages}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <ArrowDownward color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Data
                  </Typography>
                  <Typography variant="h6">
                    {formatBytes(metrics.totalBytes)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Speed color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Latency
                  </Typography>
                  <Typography variant="h6">
                    {metrics.averageLatency.toFixed(0)}ms
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTime color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Max Uptime
                  </Typography>
                  <Typography variant="h6">
                    {formatDuration(metrics.uptime)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Warning color={metrics.errorRate > 0 ? 'error' : 'success'} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Error Rate
                  </Typography>
                  <Typography variant="h6">
                    {metrics.errorRate.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Connections */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Active Connections
        </Typography>
        <List>
          {Array.from(connections.values()).map((connection) => (
            <React.Fragment key={connection.id}>
              <ListItem
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  mb: 1,
                  cursor: 'pointer',
                }}
                onClick={() => toggleConnectionExpanded(connection.id)}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={2}>
                      {getStatusIcon(connection.status)}
                      <Typography variant="subtitle1">{connection.url}</Typography>
                      <Chip
                        label={connection.status}
                        size="small"
                        color={connection.status === 'connected' ? 'success' : 'default'}
                      />
                      {connection.messagesReceived > 0 && (
                        <Chip
                          label={`${connection.messagesReceived} messages`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box display="flex" gap={2} mt={1} flexWrap="wrap">
                      <Typography variant="caption">
                        Ready State: {connection.readyState}
                      </Typography>
                      <Typography variant="caption">
                        Data: {formatBytes(connection.bytesReceived)}
                      </Typography>
                      {connection.status === 'connected' && connection.connectedAt && (
                        <Typography variant="caption" color="success.main">
                          Uptime: {formatDuration(
                            connection.totalUptime + 
                            Math.floor((new Date().getTime() - connection.connectedAt.getTime()) / 1000)
                          )}
                        </Typography>
                      )}
                      {connection.status !== 'connected' && connection.totalUptime > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Total Uptime: {formatDuration(connection.totalUptime)}
                        </Typography>
                      )}
                      {connection.reconnectAttempts > 0 && (
                        <Typography variant="caption" color="warning.main">
                          Reconnects: {connection.reconnectAttempts}
                        </Typography>
                      )}
                      {connection.error && (
                        <Typography variant="caption" color="error.main">
                          {connection.error}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <IconButton size="small">
                  {expandedConnections.has(connection.id) ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (connection.status === 'connected') {
                      disconnectSSE(connection.id);
                    } else {
                      const endpoint = SSE_ENDPOINTS.find(e => e.id === connection.id);
                      if (endpoint) connectToSSE(endpoint);
                    }
                  }}
                >
                  {connection.status === 'connected' ? <Stop /> : <PlayArrow />}
                </IconButton>
              </ListItem>
              
              <Collapse in={expandedConnections.has(connection.id)}>
                <Box sx={{ ml: 4, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Event Types
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {Array.from(connection.eventTypes.entries()).map(([type, count]) => (
                      <Chip
                        key={type}
                        label={`${type}: ${count}`}
                        size="small"
                        variant="outlined"
                        onClick={() => setFilterEventType(type)}
                      />
                    ))}
                  </Stack>
                  
                  {connection.latency.length > 0 && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Latency History
                      </Typography>
                      <Box sx={{ height: 60 }}>
                        <svg width="100%" height="60" viewBox="0 0 100 60">
                          <polyline
                            fill="none"
                            stroke="#1976d2"
                            strokeWidth="2"
                            points={connection.latency
                              .slice(-20)
                              .map((l, i, arr) => {
                                const x = (i / (arr.length - 1)) * 100;
                                const y = 60 - (l / Math.max(...arr)) * 50;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />
                        </svg>
                      </Box>
                    </>
                  )}
                </Box>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Message Stream */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Message Stream
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Filter events..."
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={<Switch checked={showRawData} onChange={(e) => setShowRawData(e.target.checked)} />}
              label="Raw"
            />
          </Stack>
        </Box>
        
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width="120">Time</TableCell>
                <TableCell width="120">Connection</TableCell>
                <TableCell width="120">Type</TableCell>
                <TableCell width="80">Size</TableCell>
                <TableCell width="80">Latency</TableCell>
                <TableCell>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {message.connectionId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={message.type} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {formatBytes(message.size)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {message.latency && (
                      <Typography variant="caption" color={message.latency > 100 ? 'warning.main' : 'text.secondary'}>
                        {message.latency}ms
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        whiteSpace: showRawData ? 'pre-wrap' : 'nowrap',
                        maxWidth: showRawData ? 'none' : 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                      }}
                    >
                      {(() => {
                        if (message.data === undefined || message.data === null) {
                          return 'No data';
                        }
                        const dataStr = typeof message.data === 'string' ? message.data : JSON.stringify(message.data);
                        return showRawData ? dataStr : dataStr.substring(0, 100) + (dataStr.length > 100 ? '...' : '');
                      })()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div ref={messagesEndRef} />
        </TableContainer>
      </Paper>
    </Box>
  );
};