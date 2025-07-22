import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { BrowserRouter } from 'react-router-dom';
import { createAppTheme, defaultThemeConfig } from '../theme/theme';
import { ThemeConfig } from '../types/theme.types';
import { AppRouter } from './routes/AppRouter';

// Theme Context
interface ThemeContextValue {
  theme: any;
  themeConfig: ThemeConfig;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
}

export const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export const useThemeEditor = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeEditor must be used within ThemeProvider');
  }
  return context;
};

function App() {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('momentum-theme');
    return saved ? JSON.parse(saved) : defaultThemeConfig;
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('momentum-theme', JSON.stringify(themeConfig));
  }, [themeConfig]);

  // Create theme with real-time updates
  const theme = useMemo(() => createAppTheme(themeConfig), [themeConfig]);

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setThemeConfig(prev => ({
      ...prev,
      ...updates,
      palette: updates.palette ? { ...prev.palette, ...updates.palette } : prev.palette,
      typography: updates.typography ? { ...prev.typography, ...updates.typography } : prev.typography,
      shape: updates.shape ? { ...prev.shape, ...updates.shape } : prev.shape,
      shadows: updates.shadows ? { ...prev.shadows, ...updates.shadows } : prev.shadows,
    }));
  };

  const resetTheme = () => {
    setThemeConfig(defaultThemeConfig);
  };

  const themeContextValue: ThemeContextValue = {
    theme,
    themeConfig,
    updateTheme,
    resetTheme,
  };

  return (
    <StyledEngineProvider injectFirst>
      <ThemeContext.Provider value={themeContextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <GlobalStyles
            styles={{
              '@layer mui, base, components, utilities': {},
              body: {
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                transition: 'background-color 0.2s ease, color 0.2s ease',
              },
              // Smooth scrolling
              html: {
                scrollBehavior: 'smooth',
              },
              // Better focus styles
              '*:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
            }}
          />
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </ThemeProvider>
      </ThemeContext.Provider>
    </StyledEngineProvider>
  );
}

export default App;