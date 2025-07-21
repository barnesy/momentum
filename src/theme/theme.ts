import { createTheme, Theme, responsiveFontSizes } from '@mui/material/styles';
import { ThemeConfig } from '../types/theme.types';

export const defaultThemeConfig: ThemeConfig = {
  mode: 'light',
  palette: {
    primary: '#667eea',
    secondary: '#764ba2',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    success: '#00cc88',
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1Size: 3,
    h2Size: 2,
    h3Size: 1.5,
    h4Size: 1.25,
    h5Size: 1.1,
    h6Size: 1,
    body1Size: 1,
    body2Size: 0.875,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  shadows: {
    enabled: true,
    intensity: 1,
  },
  cssVariables: true,
};

export const createAppTheme = (config: ThemeConfig): Theme => {
  const theme = createTheme({
    cssVariables: config.cssVariables,
    palette: {
      mode: config.mode,
      primary: {
        main: config.palette.primary,
      },
      secondary: {
        main: config.palette.secondary,
      },
      error: {
        main: config.palette.error,
      },
      warning: {
        main: config.palette.warning,
      },
      info: {
        main: config.palette.info,
      },
      success: {
        main: config.palette.success,
      },
      background: config.mode === 'light' ? {
        default: config.palette.background.default,
        paper: config.palette.background.paper,
      } : {
        default: '#121212',
        paper: '#1e1e1e',
      },
    },
    typography: {
      fontFamily: config.typography.fontFamily,
      h1: {
        fontSize: `${config.typography.h1Size}rem`,
        fontWeight: config.typography.fontWeightBold,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: `${config.typography.h2Size}rem`,
        fontWeight: config.typography.fontWeightMedium,
      },
      h3: {
        fontSize: `${config.typography.h3Size}rem`,
        fontWeight: config.typography.fontWeightMedium,
      },
      h4: {
        fontSize: `${config.typography.h4Size}rem`,
        fontWeight: config.typography.fontWeightMedium,
      },
      h5: {
        fontSize: `${config.typography.h5Size}rem`,
        fontWeight: config.typography.fontWeightRegular,
      },
      h6: {
        fontSize: `${config.typography.h6Size}rem`,
        fontWeight: config.typography.fontWeightMedium,
      },
      body1: {
        fontSize: `${config.typography.body1Size}rem`,
      },
      body2: {
        fontSize: `${config.typography.body2Size}rem`,
      },
      fontWeightLight: config.typography.fontWeightLight,
      fontWeightRegular: config.typography.fontWeightRegular,
      fontWeightMedium: config.typography.fontWeightMedium,
      fontWeightBold: config.typography.fontWeightBold,
    },
    shape: {
      borderRadius: config.shape.borderRadius,
    },
    spacing: config.spacing,
    shadows: config.shadows.enabled
      ? Array.from({ length: 25 }, (_, i) => {
          if (i === 0) return 'none';
          const y = Math.ceil(i * 0.5);
          const blur = i * 2;
          const opacity = 0.1 + i * 0.01 * config.shadows.intensity;
          return `0px ${y}px ${blur}px rgba(0,0,0,${opacity})`;
        }) as any
      : Array(25).fill('none') as any,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: config.mode === 'light' ? "#959595 #e0e0e0" : "#6b6b6b #2b2b2b",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              backgroundColor: config.mode === 'light' ? "#e0e0e0" : "#2b2b2b",
              width: 12,
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: 8,
              backgroundColor: config.mode === 'light' ? "#959595" : "#6b6b6b",
              minHeight: 24,
              border: `3px solid ${config.mode === 'light' ? "#e0e0e0" : "#2b2b2b"}`,
            },
            "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
              backgroundColor: config.mode === 'light' ? "#717171" : "#8b8b8b",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: config.shape.borderRadius * 0.67,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: config.shape.borderRadius,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: config.shape.borderRadius * 0.67,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  return responsiveFontSizes(theme);
};