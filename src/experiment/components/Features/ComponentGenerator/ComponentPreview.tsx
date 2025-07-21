import React from 'react';
import { Box, Paper } from '@mui/material';
import { SyntaxHighlighter } from './SyntaxHighlighter';

interface ComponentPreviewProps {
  component: React.FC<any>;
  props: Record<string, any>;
  showCode?: boolean;
  compact?: boolean;
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  component: Component,
  props,
  showCode = false,
  compact = false,
}) => {
  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          p: compact ? 2 : 4,
          backgroundColor: 'background.default',
          minHeight: compact ? 100 : 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Component {...props} />
        </Box>
      </Paper>
      
      {showCode && !compact && (
        <Paper
          variant="outlined"
          sx={{
            mt: 2,
            overflow: 'hidden',
            maxHeight: 200,
          }}
        >
          <SyntaxHighlighter
            code={`<${Component.name || 'Component'} ${Object.entries(props)
              .map(([key, value]) => {
                if (typeof value === 'string') {
                  return `${key}="${value}"`;
                }
                if (typeof value === 'boolean' && value) {
                  return key;
                }
                if (typeof value === 'number') {
                  return `${key}={${value}}`;
                }
                if (typeof value === 'object' && value !== null) {
                  return `${key}={${JSON.stringify(value)}}`;
                }
                return `${key}={...}`;
              })
              .filter(Boolean)
              .join(' ')} />`}
            language="tsx"
            wrapLongLines
          />
        </Paper>
      )}
    </Box>
  );
};