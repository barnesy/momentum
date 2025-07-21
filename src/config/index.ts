export const config = {
  // API Endpoints
  api: {
    baseUrl: process.env.VITE_API_URL || 'http://localhost:3000',
    sse: {
      events: '/events',
      errors: '/error-stream',
    },
    context: {
      update: '/context/update',
      get: '/context',
    },
    patterns: {
      analyze: '/patterns/analyze',
    },
  },

  // WebSocket Configuration
  ws: {
    errorReporter: 'ws://localhost:8765',
    claudeListener: 'ws://localhost:8766',
  },

  // GitHub Configuration
  github: {
    apiUrl: 'https://api.github.com',
    webhookPath: '/webhook',
  },

  // Extension Configuration
  extension: {
    retryAttempts: 5,
    retryDelay: 3000,
  },

  // Performance Settings
  performance: {
    cacheTimeout: 15 * 60 * 1000, // 15 minutes
    updateInterval: 1000, // 1 second
    maxLatencyHistory: 100,
  },

  // Theme Settings
  theme: {
    defaultMode: 'light' as const,
    enableCssVariables: true,
  },
} as const;

// Helper functions
export const getApiUrl = (path: string): string => {
  return `${config.api.baseUrl}${path}`;
};

export const getSSEUrl = (path: string): string => {
  return `${config.api.baseUrl}${path}`;
};

export const getWebSocketUrl = (path: string): string => {
  return path.startsWith('ws://') || path.startsWith('wss://') 
    ? path 
    : `ws://localhost:${path}`;
};