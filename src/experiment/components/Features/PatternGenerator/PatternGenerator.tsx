import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  Alert,
  CircularProgress,
  Fade,
  Stack,
  Divider,
} from '@mui/material';
import {
  AutoAwesome as GenerateIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Palette as PaletteIcon,
  Texture as TextureIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';

interface Pattern {
  id: string;
  name: string;
  css: string;
  svg?: string;
  colors: string[];
  type: 'gradient' | 'geometric' | 'organic' | 'abstract';
}

interface PatternVariant {
  id: string;
  parentId: string;
  name: string;
  css: string;
  colors: string[];
}

const PATTERN_TEMPLATES = {
  gradient: [
    {
      name: 'Linear Gradient',
      template: (colors: string[]) => `linear-gradient(135deg, ${colors.join(', ')})`,
    },
    {
      name: 'Radial Gradient',
      template: (colors: string[]) => `radial-gradient(circle, ${colors.join(', ')})`,
    },
    {
      name: 'Conic Gradient',
      template: (colors: string[]) => `conic-gradient(from 180deg, ${colors.join(', ')})`,
    },
  ],
  geometric: [
    {
      name: 'Stripes',
      template: (colors: string[]) => `repeating-linear-gradient(45deg, ${colors[0]}, ${colors[0]} 10px, ${colors[1]} 10px, ${colors[1]} 20px)`,
    },
    {
      name: 'Checkerboard',
      template: (colors: string[]) => `
        linear-gradient(45deg, ${colors[0]} 25%, transparent 25%),
        linear-gradient(-45deg, ${colors[0]} 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, ${colors[0]} 75%),
        linear-gradient(-45deg, transparent 75%, ${colors[0]} 75%)
      `,
    },
    {
      name: 'Dots',
      template: (colors: string[]) => `radial-gradient(circle, ${colors[0]} 20%, transparent 20%)`,
    },
  ],
  organic: [
    {
      name: 'Waves',
      template: (colors: string[]) => `
        radial-gradient(ellipse farthest-corner at top left, ${colors[0]} 0%, transparent 50%),
        radial-gradient(ellipse farthest-corner at top right, ${colors[1]} 0%, transparent 50%),
        radial-gradient(ellipse farthest-corner at bottom left, ${colors[2] || colors[0]} 0%, transparent 50%)
      `,
    },
    {
      name: 'Bubbles',
      template: (colors: string[]) => `
        radial-gradient(circle at 20% 80%, ${colors[0]} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${colors[1]} 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, ${colors[2] || colors[0]} 0%, transparent 50%)
      `,
    },
  ],
};

export const PatternGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [variants, setVariants] = useState<PatternVariant[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractColorsFromPrompt = (prompt: string): string[] => {
    // Simple color extraction - in a real app, this would use AI
    const colorKeywords = {
      'blue': ['#1976d2', '#42a5f5', '#90caf9'],
      'ocean': ['#006064', '#0097a7', '#4dd0e1'],
      'sunset': ['#f4511e', '#ff6f00', '#ffca28'],
      'forest': ['#1b5e20', '#388e3c', '#81c784'],
      'purple': ['#6a1b9a', '#ab47bc', '#ce93d8'],
      'warm': ['#d32f2f', '#f57c00', '#ffd54f'],
      'cool': ['#0288d1', '#00acc1', '#4fc3f7'],
      'earth': ['#5d4037', '#8d6e63', '#d7ccc8'],
    };

    const words = prompt.toLowerCase().split(' ');
    for (const [keyword, colors] of Object.entries(colorKeywords)) {
      if (words.includes(keyword)) {
        return colors;
      }
    }

    // Default colors
    return ['#667eea', '#764ba2', '#f093fb'];
  };

  const determinePatternType = (prompt: string): 'gradient' | 'geometric' | 'organic' | 'abstract' => {
    const promptLower = prompt.toLowerCase();
    if (promptLower.includes('stripe') || promptLower.includes('line') || promptLower.includes('geometric')) {
      return 'geometric';
    }
    if (promptLower.includes('wave') || promptLower.includes('organic') || promptLower.includes('flow')) {
      return 'organic';
    }
    if (promptLower.includes('abstract') || promptLower.includes('random')) {
      return 'abstract';
    }
    return 'gradient';
  };

  const generatePatterns = useCallback(() => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    // Simulate AI generation delay
    setTimeout(() => {
      const colors = extractColorsFromPrompt(prompt);
      const patternType = determinePatternType(prompt);
      const templates = PATTERN_TEMPLATES[patternType] || PATTERN_TEMPLATES.gradient;

      const newPatterns: Pattern[] = templates.map((template, index) => ({
        id: `pattern-${Date.now()}-${index}`,
        name: template.name,
        css: template.template(colors),
        colors,
        type: patternType,
      }));

      setPatterns(newPatterns);
      setIsGenerating(false);
    }, 1500);
  }, [prompt]);

  const generateVariants = useCallback((pattern: Pattern) => {
    setSelectedPattern(pattern);
    
    // Generate color variants
    const colorVariants: PatternVariant[] = [];
    
    // Lighter variant
    const lighterColors = pattern.colors.map(color => {
      const rgb = parseInt(color.slice(1), 16);
      const r = ((rgb >> 16) & 255) + 30;
      const g = ((rgb >> 8) & 255) + 30;
      const b = (rgb & 255) + 30;
      return `#${((1 << 24) + (Math.min(r, 255) << 16) + (Math.min(g, 255) << 8) + Math.min(b, 255)).toString(16).slice(1)}`;
    });

    // Darker variant
    const darkerColors = pattern.colors.map(color => {
      const rgb = parseInt(color.slice(1), 16);
      const r = Math.max(0, ((rgb >> 16) & 255) - 30);
      const g = Math.max(0, ((rgb >> 8) & 255) - 30);
      const b = Math.max(0, (rgb & 255) - 30);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    });

    // Create variants with different color schemes
    colorVariants.push({
      id: `variant-${Date.now()}-1`,
      parentId: pattern.id,
      name: 'Lighter',
      css: pattern.css.replace(new RegExp(pattern.colors.join('|'), 'g'), (match) => {
        const index = pattern.colors.indexOf(match);
        return lighterColors[index] || match;
      }),
      colors: lighterColors,
    });

    colorVariants.push({
      id: `variant-${Date.now()}-2`,
      parentId: pattern.id,
      name: 'Darker',
      css: pattern.css.replace(new RegExp(pattern.colors.join('|'), 'g'), (match) => {
        const index = pattern.colors.indexOf(match);
        return darkerColors[index] || match;
      }),
      colors: darkerColors,
    });

    // Inverted variant
    colorVariants.push({
      id: `variant-${Date.now()}-3`,
      parentId: pattern.id,
      name: 'Inverted',
      css: pattern.css.replace(new RegExp(pattern.colors.join('|'), 'g'), (match) => {
        const index = pattern.colors.indexOf(match);
        return pattern.colors[pattern.colors.length - 1 - index] || match;
      }),
      colors: [...pattern.colors].reverse(),
    });

    setVariants(colorVariants);
  }, []);

  const copyToClipboard = (css: string) => {
    navigator.clipboard.writeText(`background: ${css};`);
  };

  const downloadPattern = (pattern: Pattern | PatternVariant) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // This is simplified - in a real app, you'd properly render the CSS pattern
      const gradient = ctx.createLinearGradient(0, 0, 400, 400);
      pattern.colors.forEach((color, index) => {
        gradient.addColorStop(index / (pattern.colors.length - 1), color);
      });
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 400);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `pattern-${pattern.id}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <TextureIcon color="primary" />
            <Typography variant="h6">Pattern Generator</Typography>
          </Box>

          <Stack spacing={3}>
            {/* Prompt Input */}
            <Box>
              <TextField
                fullWidth
                label="Describe your pattern"
                placeholder="e.g., 'ocean waves with blue gradient' or 'geometric stripes in warm colors'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generatePatterns()}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                <Chip
                  label="Ocean theme"
                  size="small"
                  onClick={() => setPrompt('ocean waves with deep blue gradient')}
                />
                <Chip
                  label="Sunset vibes"
                  size="small"
                  onClick={() => setPrompt('warm sunset gradient with orange and pink')}
                />
                <Chip
                  label="Geometric"
                  size="small"
                  onClick={() => setPrompt('geometric stripes in purple tones')}
                />
                <Chip
                  label="Organic flow"
                  size="small"
                  onClick={() => setPrompt('organic flowing shapes in forest green')}
                />
              </Box>

              <Button
                variant="contained"
                startIcon={isGenerating ? <CircularProgress size={20} /> : <GenerateIcon />}
                onClick={generatePatterns}
                disabled={isGenerating}
                fullWidth
              >
                {isGenerating ? 'Generating...' : 'Generate Patterns'}
              </Button>
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Generated Patterns */}
            {patterns.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Generated Patterns
                </Typography>
                <Grid container spacing={2}>
                  {patterns.map((pattern) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={pattern.id}>
                      <Fade in>
                        <Paper
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 4,
                            },
                          }}
                          onClick={() => generateVariants(pattern)}
                        >
                          <Box
                            sx={{
                              height: 120,
                              borderRadius: 1,
                              background: pattern.css,
                              mb: 2,
                            }}
                          />
                          <Typography variant="subtitle2">{pattern.name}</Typography>
                          <Box display="flex" gap={0.5} mt={1}>
                            {pattern.colors.map((color, index) => (
                              <Box
                                key={index}
                                sx={{
                                  width: 20,
                                  height: 20,
                                  backgroundColor: color,
                                  borderRadius: 0.5,
                                  border: 1,
                                  borderColor: 'divider',
                                }}
                              />
                            ))}
                          </Box>
                          <Box display="flex" gap={1} mt={2}>
                            <Tooltip title="Copy CSS">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(pattern.css);
                                }}
                              >
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadPattern(pattern);
                                }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Generate Variants">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  generateVariants(pattern);
                                }}
                              >
                                <ViewModuleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Paper>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Pattern Variants */}
            {selectedPattern && variants.length > 0 && (
              <Box>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle2">
                    Variants of {selectedPattern.name}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={() => generateVariants(selectedPattern)}
                  >
                    Regenerate
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {variants.map((variant) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={variant.id}>
                      <Paper sx={{ p: 2 }}>
                        <Box
                          sx={{
                            height: 80,
                            borderRadius: 1,
                            background: variant.css,
                            mb: 1,
                          }}
                        />
                        <Typography variant="caption">{variant.name}</Typography>
                        <Box display="flex" gap={0.5} mt={0.5}>
                          {variant.colors.map((color, index) => (
                            <Box
                              key={index}
                              sx={{
                                width: 16,
                                height: 16,
                                backgroundColor: color,
                                borderRadius: 0.5,
                                border: 1,
                                borderColor: 'divider',
                              }}
                            />
                          ))}
                        </Box>
                        <Box display="flex" gap={0.5} mt={1}>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(variant.css)}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => downloadPattern(variant)}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};