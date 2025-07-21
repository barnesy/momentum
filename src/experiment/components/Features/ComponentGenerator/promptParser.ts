export interface ComponentSpec {
  type: string;
  elements: ElementSpec[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  variant?: string;
}

export interface ElementSpec {
  type: string;
  label?: string;
  dataType?: string;
  required?: boolean;
}

const elementPatterns: Record<string, { type: string; dataType: string }> = {
  // Text elements
  title: { type: 'text', dataType: 'heading' },
  heading: { type: 'text', dataType: 'heading' },
  subtitle: { type: 'text', dataType: 'subheading' },
  description: { type: 'text', dataType: 'body' },
  label: { type: 'text', dataType: 'label' },
  
  // Data display
  stats: { type: 'data', dataType: 'metric' },
  metric: { type: 'data', dataType: 'metric' },
  value: { type: 'data', dataType: 'value' },
  price: { type: 'data', dataType: 'currency' },
  
  // Status elements
  status: { type: 'status', dataType: 'badge' },
  badge: { type: 'status', dataType: 'badge' },
  tag: { type: 'status', dataType: 'chip' },
  
  // User elements
  avatar: { type: 'media', dataType: 'avatar' },
  image: { type: 'media', dataType: 'image' },
  icon: { type: 'media', dataType: 'icon' },
  
  // Interactive elements
  button: { type: 'action', dataType: 'button' },
  'action button': { type: 'action', dataType: 'button' },
  actions: { type: 'action', dataType: 'button-group' },
  cta: { type: 'action', dataType: 'button' },
  
  // Form elements
  search: { type: 'input', dataType: 'search' },
  filter: { type: 'input', dataType: 'select' },
  input: { type: 'input', dataType: 'text' },
  
  // Navigation
  breadcrumbs: { type: 'navigation', dataType: 'breadcrumbs' },
  tabs: { type: 'navigation', dataType: 'tabs' },
  
  // Lists
  list: { type: 'list', dataType: 'list' },
  features: { type: 'list', dataType: 'features' },
  
  // User info
  name: { type: 'text', dataType: 'name' },
  email: { type: 'text', dataType: 'email' },
  role: { type: 'text', dataType: 'role' },
  bio: { type: 'text', dataType: 'body' },
};

const componentTypePatterns = {
  header: ['header', 'heading', 'page header'],
  card: ['card', 'panel', 'box'],
  dashboard: ['dashboard', 'stats', 'metrics'],
  profile: ['profile', 'user', 'member'],
  section: ['section', 'feature', 'content'],
  alert: ['alert', 'banner', 'notification'],
  table: ['table', 'data table', 'list'],
  pricing: ['pricing', 'plan', 'subscription'],
};

export function parseComponentPrompt(prompt: string): ComponentSpec {
  const lowerPrompt = prompt.toLowerCase();
  
  // Determine component type
  let componentType = 'card'; // default
  for (const [type, patterns] of Object.entries(componentTypePatterns)) {
    if (patterns.some(pattern => lowerPrompt.includes(pattern))) {
      componentType = type;
      break;
    }
  }
  
  // Extract elements
  const elements: ElementSpec[] = [];
  const parts = lowerPrompt.split(/[,:;]/);
  
  parts.forEach(part => {
    const trimmed = part.trim();
    
    // Check for exact matches first
    for (const [pattern, spec] of Object.entries(elementPatterns)) {
      if (trimmed.includes(pattern)) {
        elements.push({
          ...spec,
          label: pattern,
          required: true,
        });
      }
    }
    
    // Check for numbered items (e.g., "4 metric cards")
    const numberMatch = trimmed.match(/(\d+)\s+(\w+)/);
    if (numberMatch) {
      const count = parseInt(numberMatch[1]);
      const itemType = numberMatch[2];
      
      for (let i = 0; i < count; i++) {
        const elementSpec = elementPatterns[itemType] || { type: 'data', dataType: 'text' };
        elements.push({
          ...elementSpec,
          label: `${itemType} ${i + 1}`,
        });
      }
    }
  });
  
  // Determine layout based on component type and elements
  let layout: 'horizontal' | 'vertical' | 'grid' = 'vertical';
  if (componentType === 'header' || elements.length <= 3) {
    layout = 'horizontal';
  } else if (componentType === 'dashboard' || elements.some(e => e.dataType === 'metric')) {
    layout = 'grid';
  }
  
  // Determine variant
  let variant = 'default';
  if (lowerPrompt.includes('minimal')) variant = 'minimal';
  if (lowerPrompt.includes('compact')) variant = 'compact';
  if (lowerPrompt.includes('detailed')) variant = 'detailed';
  
  return {
    type: componentType,
    elements: elements.length > 0 ? elements : [
      { type: 'text', dataType: 'heading', label: 'title' },
      { type: 'text', dataType: 'body', label: 'content' },
    ],
    layout,
    variant,
  };
}