import React from 'react';
import {
  Box,
  Typography,
  Slider,
  Tabs,
  Tab,
  Grid,
  Paper,
  Chip,
} from '@mui/material';
import { ThemeConfig } from '../../../types/theme.types';

interface FontSizeControlsProps {
  themeConfig: ThemeConfig;
  onTypographyChange: (key: keyof ThemeConfig['typography'], value: any) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`font-tabpanel-${index}`}
      aria-labelledby={`font-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export const FontSizeControls: React.FC<FontSizeControlsProps> = ({
  themeConfig,
  onTypographyChange,
}) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const headingVariants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
  const textVariants = ['body1', 'body2'] as const;

  const renderSlider = (variant: string) => {
    const currentSize = themeConfig.typography[`${variant}Size` as keyof ThemeConfig['typography']] as number;
    
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: 'action.hover',
          borderRadius: 2,
          height: '100%',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" fontWeight={600}>
            {variant.toUpperCase()}
          </Typography>
          <Chip 
            label={`${currentSize.toFixed(1)}rem`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        
        <Slider
          value={currentSize}
          onChange={(_, value) => 
            onTypographyChange(`${variant}Size` as keyof ThemeConfig['typography'], value as number)
          }
          min={0.5}
          max={4}
          step={0.1}
          valueLabelDisplay="auto"
          marks={[
            { value: 0.5, label: '0.5' },
            { value: 2, label: '2' },
            { value: 4, label: '4' },
          ]}
          sx={{
            mb: 2,
            '& .MuiSlider-markLabel': {
              fontSize: '0.75rem',
            },
          }}
        />
        
        <Box
          sx={{
            p: 2,
            backgroundColor: 'background.paper',
            borderRadius: 1,
            minHeight: 60,
            display: 'flex',
            alignItems: 'center',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography 
            variant={variant as any} 
            sx={{ 
              fontSize: `${currentSize}rem`,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {variant.startsWith('h') ? `Heading ${variant[1]}` : 
             variant === 'body1' ? 'Body Text Primary' : 
             'Body Text Secondary'}
          </Typography>
        </Box>
      </Paper>
    );
  };

  return (
    <Box>
      <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
        Font Sizes
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="font size tabs">
          <Tab label="Headings" />
          <Tab label="Body Text" />
          <Tab label="All Sizes" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {headingVariants.map((variant) => (
            <Grid size={{ xs: 12, md: 6 }} key={variant}>
              {renderSlider(variant)}
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {textVariants.map((variant) => (
            <Grid size={{ xs: 12, md: 6 }} key={variant}>
              {renderSlider(variant)}
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={2}>
          {[...headingVariants, ...textVariants].map((variant) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={variant}>
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="caption" fontWeight={600}>
                    {variant.toUpperCase()}
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {(themeConfig.typography[`${variant}Size` as keyof ThemeConfig['typography']] as number).toFixed(1)}rem
                  </Typography>
                </Box>
                <Slider
                  value={themeConfig.typography[`${variant}Size` as keyof ThemeConfig['typography']] as number}
                  onChange={(_, value) => 
                    onTypographyChange(`${variant}Size` as keyof ThemeConfig['typography'], value as number)
                  }
                  min={0.5}
                  max={4}
                  step={0.1}
                  valueLabelDisplay="auto"
                  size="small"
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Box>
  );
};