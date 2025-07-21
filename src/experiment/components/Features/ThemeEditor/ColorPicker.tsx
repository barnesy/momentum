import React from 'react';
import { Box, TextField, Typography } from '@mui/material';

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
  return (
    <Box>
      <Typography variant="body2" gutterBottom sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Box display="flex" alignItems="center" gap={1}>
        <TextField
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ width: 48, height: 40 }}
          inputProps={{ style: { padding: 4, height: 32 } }}
        />
        <TextField
          value={value}
          onChange={(e) => onChange(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
          helperText={helperText}
        />
      </Box>
    </Box>
  );
};