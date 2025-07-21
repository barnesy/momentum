import React, { useState, useEffect } from 'react';
import { Box, Alert, CircularProgress, Typography } from '@mui/material';
import * as MuiComponents from '@mui/material';
import * as MuiIcons from '@mui/icons-material';

interface DynamicComponentRendererProps {
  code: string;
  props: Record<string, any>;
  onError?: (error: Error) => void;
}

export const DynamicComponentRenderer: React.FC<DynamicComponentRendererProps> = ({
  code,
  props,
  onError
}) => {
  const [Component, setComponent] = useState<React.FC<any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      // Create a function that evaluates the component code
      const evaluateComponent = (componentCode: string) => {
        // Extract the component name from the code
        const componentNameMatch = componentCode.match(/export\s+(?:const|function)\s+(\w+)/);
        const componentName = componentNameMatch ? componentNameMatch[1] : 'GeneratedComponent';

        // Create a wrapper with all MUI components in scope
        const wrapperCode = `
          const { ${Object.keys(MuiComponents).join(', ')} } = MuiComponents;
          const { ${Object.keys(MuiIcons).join(', ')} } = MuiIcons;
          
          ${componentCode}
          
          return ${componentName};
        `;

        try {
          // Create function with proper scope
          // eslint-disable-next-line no-new-func
          const componentFunction = new Function(
            'React',
            'MuiComponents', 
            'MuiIcons',
            wrapperCode
          );

          // Call the function with dependencies
          return componentFunction(React, MuiComponents, MuiIcons);
        } catch (evalError) {
          console.error('Evaluation error:', evalError);
          throw evalError;
        }
      };

      // Clean up the code - more careful TypeScript removal
      let cleanedCode = code
        .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '') // Remove imports
        .replace(/export\s+default\s+/g, 'export const '); // Convert default exports
      
      // Remove interface blocks (handle nested braces)
      cleanedCode = cleanedCode.replace(/interface\s+\w+\s*{[\s\S]*?}\s*\n?/g, '');
      
      // Remove type aliases
      cleanedCode = cleanedCode.replace(/type\s+\w+\s*=\s*[^;]+;\s*\n?/g, '');
      
      // Remove React.FC type but keep the arrow function
      cleanedCode = cleanedCode.replace(/:\s*React\.FC<[^>]+>\s*=/g, ' =');
      cleanedCode = cleanedCode.replace(/:\s*React\.FC\s*=/g, ' =');
      
      // Remove parameter type annotations but keep the parameters
      // Handle object destructuring and default values
      cleanedCode = cleanedCode.replace(/(\w+)\s*:\s*[^,)=\s]+\s*=\s*([^,)]+)([,)])/g, '$1 = $2$3'); // With defaults
      cleanedCode = cleanedCode.replace(/(\w+)\s*:\s*[^,)=]+([,)])/g, '$1$2'); // Without defaults
      
      // Remove return type annotations
      cleanedCode = cleanedCode.replace(/\)\s*:\s*[^{]+{/g, ') {');
      
      cleanedCode = cleanedCode.trim();

      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('=== Dynamic Component Renderer ===');
        console.log('Original code:', code);
        console.log('Cleaned code:', cleanedCode);
      }

      const GeneratedComponent = evaluateComponent(cleanedCode);
      
      // Validate the component
      if (typeof GeneratedComponent !== 'function') {
        throw new Error('Generated component is not a valid React component');
      }

      setComponent(() => GeneratedComponent);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to render component';
      setError(errorMessage);
      setLoading(false);
      if (onError && err instanceof Error) {
        onError(err);
      }
    }
  }, [code, onError]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Failed to render component
        </Typography>
        <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace' }}>
          {error}
        </Typography>
      </Alert>
    );
  }

  if (!Component) {
    return (
      <Alert severity="warning">
        No component to render
      </Alert>
    );
  }

  try {
    return <Component {...props} />;
  } catch (renderError) {
    return (
      <Alert severity="error">
        <Typography variant="subtitle2" gutterBottom>
          Runtime error in component
        </Typography>
        <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace' }}>
          {renderError instanceof Error ? renderError.message : 'Unknown error'}
        </Typography>
      </Alert>
    );
  }
};