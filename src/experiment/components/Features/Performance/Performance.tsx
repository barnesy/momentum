import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Paper,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import { PerformanceMetric } from '../../../types/api.types';

export const Performance: React.FC = () => {
  const [timeframe, setTimeframe] = useState('1h');

  const metrics: PerformanceMetric[] = [
    { label: 'API Latency', value: '45ms', trend: 'up' },
    { label: 'Memory Usage', value: '128MB', trend: 'stable' },
    { label: 'CPU Usage', value: '23%', trend: 'down' },
    { label: 'Active Connections', value: '12', trend: 'up' },
  ];

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    setTimeframe(event.target.value);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">
                  Performance Metrics
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={timeframe}
                    onChange={handleTimeframeChange}
                  >
                    <MenuItem value="1h">Last Hour</MenuItem>
                    <MenuItem value="24h">Last 24 Hours</MenuItem>
                    <MenuItem value="7d">Last 7 Days</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Grid container spacing={2}>
                {metrics.map((metric, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {metric.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {metric.label}
                      </Typography>
                      <Chip
                        size="small"
                        label={metric.trend}
                        color={
                          metric.trend === 'up' ? 'success' : 
                          metric.trend === 'down' ? 'error' : 
                          'default'
                        }
                        sx={{ mt: 1 }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};