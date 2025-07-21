import React from 'react';
import { Box, TextField, Typography, Paper, InputAdornment } from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  helperText,
}) => {
  const handleColorChange = (newValue: string) => {
    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(newValue) || newValue === '') {
      onChange(newValue);
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        backgroundColor: 'action.hover',
        borderRadius: 2,
        height: '100%',
      }}
    >
      <Box display="flex" flexDirection="column" gap={1.5}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" fontWeight={600}>
            {label}
          </Typography>
          <Box 
            sx={{ 
              width: 24, 
              height: 24, 
              backgroundColor: value,
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
            }} 
          />
        </Box>
        
        <Box display="flex" alignItems="stretch" gap={1}>
          <Box
            component="label"
            sx={{
              position: 'relative',
              width: 56,
              height: 40,
              flexShrink: 0,
              cursor: 'pointer',
              borderRadius: 1,
              overflow: 'hidden',
              border: 2,
              borderColor: 'divider',
              transition: 'border-color 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{
                position: 'absolute',
                inset: -2,
                width: 'calc(100% + 4px)',
                height: 'calc(100% + 4px)',
                cursor: 'pointer',
                border: 'none',
                padding: 0,
              }}
            />
          </Box>
          
          <TextField
            value={value}
            onChange={(e) => handleColorChange(e.target.value)}
            size="small"
            placeholder="#000000"
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': {
                height: 40,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PaletteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>
        
        {helperText && (
          <Typography variant="caption" color="text.secondary">
            {helperText}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};