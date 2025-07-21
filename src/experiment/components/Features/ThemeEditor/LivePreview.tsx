import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Box,
  Button,
  IconButton,
  Fab,
  Alert,
  Chip,
  TextField,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Checkbox,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

export const LivePreview: React.FC = () => {
  return (
    <Card sx={{ position: 'sticky', top: 80 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Live Preview - All Components Update in Real-Time
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Stack spacing={3}>
          {/* Typography Examples */}
          <Box>
            <Typography variant="overline" color="text.secondary">Typography</Typography>
            <Typography variant="h1">Heading 1</Typography>
            <Typography variant="h2">Heading 2</Typography>
            <Typography variant="h3">Heading 3</Typography>
            <Typography variant="body1">
              Body text appears like this. The quick brown fox jumps over the lazy dog.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Secondary body text with smaller size.
            </Typography>
          </Box>

          <Divider />

          {/* Buttons */}
          <Box>
            <Typography variant="overline" color="text.secondary">Buttons</Typography>
            <Box display="flex" gap={2} flexWrap="wrap" mt={1}>
              <Button variant="contained" color="primary">Primary</Button>
              <Button variant="contained" color="secondary">Secondary</Button>
              <Button variant="outlined" color="primary">Outlined</Button>
              <Button variant="text" color="primary">Text</Button>
              <IconButton color="primary">
                <AddIcon />
              </IconButton>
              <Fab color="primary" size="small">
                <AddIcon />
              </Fab>
            </Box>
          </Box>

          <Divider />

          {/* Alert Examples */}
          <Box>
            <Typography variant="overline" color="text.secondary">Alerts</Typography>
            <Stack spacing={1} mt={1}>
              <Alert severity="error">Error alert — check it out!</Alert>
              <Alert severity="warning">Warning alert — check it out!</Alert>
              <Alert severity="info">Info alert — check it out!</Alert>
              <Alert severity="success">Success alert — check it out!</Alert>
            </Stack>
          </Box>

          <Divider />

          {/* Form Elements */}
          <Box>
            <Typography variant="overline" color="text.secondary">Form Elements</Typography>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Text Field"
                variant="outlined"
                size="small"
                fullWidth
              />
              <Select size="small" value="option1" fullWidth>
                <MenuItem value="option1">Option 1</MenuItem>
                <MenuItem value="option2">Option 2</MenuItem>
              </Select>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Switch"
              />
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Checkbox"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Cards & Chips */}
          <Box>
            <Typography variant="overline" color="text.secondary">Other Components</Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mt={1} mb={2}>
              <Chip label="Default" />
              <Chip label="Primary" color="primary" />
              <Chip label="Secondary" color="secondary" />
              <Chip label="Success" color="success" />
              <Chip label="With Icon" icon={<CheckCircleIcon />} color="primary" />
            </Box>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Card Title</Typography>
                <Typography variant="body2" color="text.secondary">
                  This is a card component with the current theme settings.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">Action</Button>
              </CardActions>
            </Card>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};