/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Define colors using CSS variables for dynamic theming
        primary: {
          main: 'var(--mui-palette-primary-main)',
          light: 'var(--mui-palette-primary-light)',
          dark: 'var(--mui-palette-primary-dark)',
          contrastText: 'var(--mui-palette-primary-contrastText)',
        },
        secondary: {
          main: 'var(--mui-palette-secondary-main)',
          light: 'var(--mui-palette-secondary-light)',
          dark: 'var(--mui-palette-secondary-dark)',
          contrastText: 'var(--mui-palette-secondary-contrastText)',
        },
        error: {
          main: 'var(--mui-palette-error-main)',
          light: 'var(--mui-palette-error-light)',
          dark: 'var(--mui-palette-error-dark)',
        },
        warning: {
          main: 'var(--mui-palette-warning-main)',
          light: 'var(--mui-palette-warning-light)',
          dark: 'var(--mui-palette-warning-dark)',
        },
        info: {
          main: 'var(--mui-palette-info-main)',
          light: 'var(--mui-palette-info-light)',
          dark: 'var(--mui-palette-info-dark)',
        },
        success: {
          main: 'var(--mui-palette-success-main)',
          light: 'var(--mui-palette-success-light)',
          dark: 'var(--mui-palette-success-dark)',
        },
        background: {
          default: 'var(--mui-palette-background-default)',
          paper: 'var(--mui-palette-background-paper)',
        },
        text: {
          primary: 'var(--mui-palette-text-primary)',
          secondary: 'var(--mui-palette-text-secondary)',
          disabled: 'var(--mui-palette-text-disabled)',
        },
        divider: 'var(--mui-palette-divider)',
      },
      spacing: {
        // Map MUI spacing to Tailwind
        0.5: '4px',   // MUI spacing(0.5)
        1: '8px',     // MUI spacing(1)
        1.5: '12px',  // MUI spacing(1.5)
        2: '16px',    // MUI spacing(2)
        2.5: '20px',  // MUI spacing(2.5)
        3: '24px',    // MUI spacing(3)
        3.5: '28px',  // MUI spacing(3.5)
        4: '32px',    // MUI spacing(4)
        5: '40px',    // MUI spacing(5)
        6: '48px',    // MUI spacing(6)
        7: '56px',    // MUI spacing(7)
        8: '64px',    // MUI spacing(8)
        9: '72px',    // MUI spacing(9)
        10: '80px',   // MUI spacing(10)
      },
      borderRadius: {
        xs: 'var(--mui-shape-borderRadius-xs, 4px)',
        sm: 'var(--mui-shape-borderRadius-sm, 6px)',
        md: 'var(--mui-shape-borderRadius-md, 8px)',
        lg: 'var(--mui-shape-borderRadius-lg, 12px)',
        xl: 'var(--mui-shape-borderRadius-xl, 16px)',
      },
      fontFamily: {
        sans: 'var(--mui-typography-fontFamily)',
      },
      fontSize: {
        h1: 'var(--mui-typography-h1-fontSize)',
        h2: 'var(--mui-typography-h2-fontSize)',
        h3: 'var(--mui-typography-h3-fontSize)',
        h4: 'var(--mui-typography-h4-fontSize)',
        h5: 'var(--mui-typography-h5-fontSize)',
        h6: 'var(--mui-typography-h6-fontSize)',
        body1: 'var(--mui-typography-body1-fontSize)',
        body2: 'var(--mui-typography-body2-fontSize)',
        caption: 'var(--mui-typography-caption-fontSize)',
      },
      zIndex: {
        mobileStepper: 1000,
        fab: 1050,
        speedDial: 1050,
        appBar: 1100,
        drawer: 1200,
        modal: 1300,
        snackbar: 1400,
        tooltip: 1500,
      },
    },
  },
  plugins: [],
  // Important: This ensures Tailwind CSS works with MUI's CSS layers
  corePlugins: {
    preflight: false, // Disable Tailwind's base reset to avoid conflicts with MUI
  },
}