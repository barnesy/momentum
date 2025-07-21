// Momentum MUI Component Detection System
// Detects and analyzes Material-UI components in the DOM

class MUIDetector {
  constructor() {
    this.muiComponents = new Map();
    this.themeConfig = null;
    this.designTokens = {};
    this.componentPatterns = {
      // Core MUI component patterns
      Button: {
        classes: ['MuiButton-root', 'MuiButtonBase-root'],
        props: ['variant', 'color', 'size', 'disabled', 'startIcon', 'endIcon']
      },
      TextField: {
        classes: ['MuiTextField-root', 'MuiInputBase-root'],
        props: ['variant', 'label', 'error', 'helperText', 'required']
      },
      Card: {
        classes: ['MuiCard-root', 'MuiPaper-root'],
        props: ['elevation', 'variant']
      },
      AppBar: {
        classes: ['MuiAppBar-root'],
        props: ['position', 'color', 'elevation']
      },
      Typography: {
        classes: ['MuiTypography-root'],
        props: ['variant', 'component', 'color', 'align']
      },
      Grid: {
        classes: ['MuiGrid-root', 'MuiGrid-container', 'MuiGrid-item'],
        props: ['container', 'item', 'spacing', 'xs', 'sm', 'md', 'lg', 'xl']
      },
      Dialog: {
        classes: ['MuiDialog-root', 'MuiModal-root'],
        props: ['open', 'maxWidth', 'fullWidth']
      },
      IconButton: {
        classes: ['MuiIconButton-root'],
        props: ['color', 'size', 'edge']
      },
      Chip: {
        classes: ['MuiChip-root'],
        props: ['variant', 'color', 'size', 'clickable', 'deletable']
      },
      List: {
        classes: ['MuiList-root'],
        props: ['dense', 'disablePadding']
      }
    };
    
    this.init();
  }

  init() {
    this.detectTheme();
    this.scanComponents();
    this.setupMutationObserver();
    this.analyzeDesignCompliance();
  }

  detectTheme() {
    // Try to detect MUI theme from the page
    const themeProvider = document.querySelector('[class*="MuiThemeProvider"]');
    
    if (themeProvider) {
      // Extract theme from React props (if available)
      const reactKey = Object.keys(themeProvider).find(key => key.startsWith('__react'));
      if (reactKey) {
        const fiber = themeProvider[reactKey];
        this.extractThemeFromFiber(fiber);
      }
    }
    
    // Fallback: analyze computed styles
    this.analyzeComputedTheme();
  }

  extractThemeFromFiber(fiber) {
    try {
      // Navigate React fiber to find theme
      let current = fiber;
      while (current) {
        if (current.memoizedProps?.theme) {
          this.themeConfig = current.memoizedProps.theme;
          console.log('MUI Theme detected:', this.themeConfig);
          break;
        }
        current = current.return;
      }
    } catch (error) {
      console.log('Could not extract theme from React fiber');
    }
  }

  analyzeComputedTheme() {
    // Analyze CSS variables and computed styles to infer theme
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    // Check for MUI CSS variables
    const muiVars = {
      primary: computedStyle.getPropertyValue('--mui-palette-primary-main'),
      secondary: computedStyle.getPropertyValue('--mui-palette-secondary-main'),
      error: computedStyle.getPropertyValue('--mui-palette-error-main'),
      warning: computedStyle.getPropertyValue('--mui-palette-warning-main'),
      info: computedStyle.getPropertyValue('--mui-palette-info-main'),
      success: computedStyle.getPropertyValue('--mui-palette-success-main')
    };
    
    // Check for theme mode
    const isDarkMode = document.body.classList.contains('mui-dark-mode') ||
                      computedStyle.getPropertyValue('--mui-palette-mode') === 'dark';
    
    this.themeConfig = {
      palette: {
        mode: isDarkMode ? 'dark' : 'light',
        ...muiVars
      },
      spacing: this.detectSpacing(),
      typography: this.detectTypography()
    };
  }

  detectSpacing() {
    // Detect MUI spacing unit
    const testElement = document.createElement('div');
    testElement.className = 'MuiBox-root';
    testElement.style.padding = '1';
    document.body.appendChild(testElement);
    
    const computedPadding = getComputedStyle(testElement).padding;
    document.body.removeChild(testElement);
    
    return parseInt(computedPadding) || 8; // Default MUI spacing
  }

  detectTypography() {
    const typography = {};
    const variants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body1', 'body2', 'caption'];
    
    variants.forEach(variant => {
      const element = document.querySelector(`.MuiTypography-${variant}`);
      if (element) {
        const styles = getComputedStyle(element);
        typography[variant] = {
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          lineHeight: styles.lineHeight,
          fontFamily: styles.fontFamily
        };
      }
    });
    
    return typography;
  }

  scanComponents() {
    // Scan DOM for MUI components
    Object.entries(this.componentPatterns).forEach(([name, pattern]) => {
      pattern.classes.forEach(className => {
        const elements = document.querySelectorAll(`.${className}`);
        elements.forEach(element => {
          this.analyzeComponent(element, name, pattern);
        });
      });
    });
    
    console.log(`Found ${this.muiComponents.size} MUI components`);
  }

  analyzeComponent(element, componentName, pattern) {
    const componentData = {
      name: componentName,
      element,
      props: this.extractProps(element, pattern.props),
      compliance: this.checkCompliance(element, componentName),
      suggestions: []
    };
    
    // Check for common issues
    this.checkAccessibility(componentData);
    this.checkPerformance(componentData);
    this.checkThemeConsistency(componentData);
    
    this.muiComponents.set(element, componentData);
  }

  extractProps(element, propList) {
    const props = {};
    
    // Extract from data attributes
    propList.forEach(prop => {
      const dataAttr = element.getAttribute(`data-${prop}`);
      if (dataAttr !== null) {
        props[prop] = dataAttr;
      }
    });
    
    // Extract from classes
    const classes = element.className.split(' ');
    classes.forEach(className => {
      // Extract variant
      if (className.includes('variant')) {
        const match = className.match(/Mui\w+-variant(\w+)/);
        if (match) props.variant = match[1].toLowerCase();
      }
      
      // Extract color
      if (className.includes('color')) {
        const match = className.match(/Mui\w+-color(\w+)/);
        if (match) props.color = match[1].toLowerCase();
      }
      
      // Extract size
      if (className.includes('size')) {
        const match = className.match(/Mui\w+-size(\w+)/);
        if (match) props.size = match[1].toLowerCase();
      }
    });
    
    return props;
  }

  checkCompliance(element, componentName) {
    const issues = [];
    
    // Check Material Design compliance
    switch (componentName) {
      case 'Button':
        // Buttons should have proper elevation
        if (!element.style.boxShadow && !element.classList.contains('MuiButton-text')) {
          issues.push({
            type: 'elevation',
            message: 'Button missing proper elevation'
          });
        }
        break;
        
      case 'TextField':
        // Text fields should have labels
        if (!element.querySelector('label') && !element.getAttribute('aria-label')) {
          issues.push({
            type: 'accessibility',
            message: 'TextField missing label'
          });
        }
        break;
        
      case 'Card':
        // Cards should have proper spacing
        const padding = getComputedStyle(element).padding;
        if (parseInt(padding) < 16) {
          issues.push({
            type: 'spacing',
            message: 'Card has insufficient padding'
          });
        }
        break;
    }
    
    return {
      compliant: issues.length === 0,
      issues
    };
  }

  checkAccessibility(componentData) {
    const { element, name } = componentData;
    
    // Universal accessibility checks
    if (!element.getAttribute('role') && this.needsRole(name)) {
      componentData.suggestions.push({
        type: 'accessibility',
        priority: 'high',
        message: `Add appropriate ARIA role to ${name}`,
        fix: `role="${this.suggestRole(name)}"`
      });
    }
    
    // Component-specific checks
    switch (name) {
      case 'Button':
      case 'IconButton':
        if (!element.textContent.trim() && !element.getAttribute('aria-label')) {
          componentData.suggestions.push({
            type: 'accessibility',
            priority: 'high',
            message: 'Button needs accessible label',
            fix: 'aria-label="Button purpose"'
          });
        }
        break;
        
      case 'TextField':
        const input = element.querySelector('input');
        if (input && !input.getAttribute('aria-describedby')) {
          const helperText = element.querySelector('.MuiFormHelperText-root');
          if (helperText) {
            componentData.suggestions.push({
              type: 'accessibility',
              priority: 'medium',
              message: 'Connect helper text to input',
              fix: 'aria-describedby="helper-text-id"'
            });
          }
        }
        break;
    }
  }

  checkPerformance(componentData) {
    const { element, name } = componentData;
    
    // Check for performance issues
    if (name === 'List') {
      const items = element.querySelectorAll('.MuiListItem-root');
      if (items.length > 50) {
        componentData.suggestions.push({
          type: 'performance',
          priority: 'high',
          message: 'Large list should use virtualization',
          fix: 'Consider using react-window or MUI DataGrid'
        });
      }
    }
    
    // Check for unnecessary re-renders
    if (element.style.cssText.includes('transition')) {
      const transitionCount = element.style.cssText.match(/transition/g).length;
      if (transitionCount > 3) {
        componentData.suggestions.push({
          type: 'performance',
          priority: 'medium',
          message: 'Too many CSS transitions',
          fix: 'Consolidate transitions for better performance'
        });
      }
    }
  }

  checkThemeConsistency(componentData) {
    const { element, props } = componentData;
    
    // Check color consistency
    if (props.color && !['primary', 'secondary', 'error', 'warning', 'info', 'success'].includes(props.color)) {
      componentData.suggestions.push({
        type: 'theme',
        priority: 'medium',
        message: 'Non-standard color prop',
        fix: 'Use theme palette colors or extend theme'
      });
    }
    
    // Check custom styles that should use theme
    const inlineStyles = element.style;
    if (inlineStyles.color && !inlineStyles.color.includes('var(')) {
      componentData.suggestions.push({
        type: 'theme',
        priority: 'low',
        message: 'Hardcoded color should use theme',
        fix: 'Use sx prop or theme.palette'
      });
    }
  }

  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            this.scanElement(node);
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  scanElement(element) {
    // Check if element is MUI component
    Object.entries(this.componentPatterns).forEach(([name, pattern]) => {
      pattern.classes.forEach(className => {
        if (element.classList?.contains(className)) {
          this.analyzeComponent(element, name, pattern);
        }
      });
    });
  }

  analyzeDesignCompliance() {
    // Overall design system compliance
    const compliance = {
      score: 0,
      issues: [],
      suggestions: []
    };
    
    // Check theme consistency
    if (!this.themeConfig) {
      compliance.issues.push('No MUI theme detected');
      compliance.suggestions.push('Wrap app in ThemeProvider');
    }
    
    // Check component usage
    const componentStats = this.getComponentStats();
    
    // Check for mixing component libraries
    if (document.querySelector('[class*="ant-"]') || document.querySelector('[class*="bp3-"]')) {
      compliance.issues.push('Multiple UI libraries detected');
      compliance.suggestions.push('Stick to MUI for consistency');
    }
    
    // Calculate compliance score
    const totalComponents = this.muiComponents.size;
    const compliantComponents = Array.from(this.muiComponents.values())
      .filter(c => c.compliance.compliant).length;
    
    compliance.score = totalComponents > 0 
      ? Math.round((compliantComponents / totalComponents) * 100)
      : 0;
    
    console.log('MUI Design Compliance:', compliance);
    return compliance;
  }

  getComponentStats() {
    const stats = {};
    
    this.muiComponents.forEach(component => {
      stats[component.name] = (stats[component.name] || 0) + 1;
    });
    
    return stats;
  }

  getSuggestions() {
    const allSuggestions = [];
    
    this.muiComponents.forEach(component => {
      component.suggestions.forEach(suggestion => {
        allSuggestions.push({
          component: component.name,
          element: component.element,
          ...suggestion
        });
      });
    });
    
    // Sort by priority
    return allSuggestions.sort((a, b) => {
      const priorities = { high: 0, medium: 1, low: 2 };
      return priorities[a.priority] - priorities[b.priority];
    });
  }

  // Helper methods
  needsRole(componentName) {
    const rolesRequired = ['Dialog', 'AppBar', 'Drawer', 'Menu'];
    return rolesRequired.includes(componentName);
  }

  suggestRole(componentName) {
    const roleMap = {
      Dialog: 'dialog',
      AppBar: 'banner',
      Drawer: 'navigation',
      Menu: 'menu',
      List: 'list',
      Button: 'button'
    };
    return roleMap[componentName] || 'region';
  }

  // Public API
  getReport() {
    return {
      theme: this.themeConfig,
      components: Array.from(this.muiComponents.values()),
      stats: this.getComponentStats(),
      compliance: this.analyzeDesignCompliance(),
      suggestions: this.getSuggestions()
    };
  }
}

// Initialize MUI detector
const muiDetector = new MUIDetector();

// Make it available globally
window.muiDetector = muiDetector;

console.log('🎨 MUI Component Detector active - analyzing Material-UI usage');