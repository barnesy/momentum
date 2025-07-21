import { PaletteMode, ThemeOptions } from '@mui/material';

export interface ThemeConfig {
  mode: PaletteMode;
  palette: PaletteConfig;
  typography: TypographyConfig;
  spacing: number;
  shape: ShapeConfig;
  shadows: ShadowConfig;
  cssVariables?: boolean;
}

export interface PaletteConfig {
  primary: string;
  secondary: string;
  error: string;
  warning: string;
  info: string;
  success: string;
  background: {
    default: string;
    paper: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
}

export interface TypographyConfig {
  fontFamily: string;
  h1Size: number;
  h2Size: number;
  h3Size: number;
  h4Size: number;
  h5Size: number;
  h6Size: number;
  body1Size: number;
  body2Size: number;
  fontWeightLight: number;
  fontWeightRegular: number;
  fontWeightMedium: number;
  fontWeightBold: number;
}

export interface ShapeConfig {
  borderRadius: number;
}

export interface ShadowConfig {
  enabled: boolean;
  intensity: number;
}

export interface CustomTheme extends ThemeOptions {
  // Add any custom theme properties here
}