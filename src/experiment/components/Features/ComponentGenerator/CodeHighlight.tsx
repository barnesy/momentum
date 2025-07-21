import React from 'react';
import { Box } from '@mui/material';

interface CodeHighlightProps {
  code: string;
  language?: 'typescript' | 'javascript' | 'jsx' | 'tsx';
}

export const CodeHighlight: React.FC<CodeHighlightProps> = ({ code, language = 'tsx' }) => {
  // Simple syntax highlighting for TypeScript/React
  const highlightCode = (code: string): string => {
    let highlighted = code;

    // Escape HTML
    highlighted = highlighted.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Keywords
    const keywords = [
      'import', 'from', 'export', 'default', 'const', 'let', 'var', 'function', 'return',
      'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
      'class', 'extends', 'interface', 'type', 'enum', 'namespace', 'async', 'await',
      'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'null', 'undefined',
      'true', 'false', 'in', 'of', 'typeof', 'instanceof', 'void', 'delete'
    ];
    
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    highlighted = highlighted.replace(keywordRegex, '<span class="keyword">$1</span>');

    // React/JSX specific
    highlighted = highlighted.replace(/(&lt;\/?)(\w+)/g, '$1<span class="tag">$2</span>');
    highlighted = highlighted.replace(/(\w+)=/g, '<span class="attribute">$1</span>=');

    // Strings (single and double quotes)
    highlighted = highlighted.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>');
    
    // Template literals
    highlighted = highlighted.replace(/`([^`]*)`/g, '<span class="string">`$1`</span>');
    
    // Comments
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
    
    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
    
    // Function names
    highlighted = highlighted.replace(/(\w+)(?=\s*\()/g, '<span class="function">$1</span>');
    
    // Types (capitalized words)
    highlighted = highlighted.replace(/\b([A-Z]\w*)\b/g, '<span class="type">$1</span>');

    // Props destructuring
    highlighted = highlighted.replace(/\{([^}]+)\}/g, (match, content) => {
      const highlightedContent = content.replace(/(\w+)/g, '<span class="property">$1</span>');
      return `{${highlightedContent}}`;
    });

    return highlighted;
  };

  return (
    <Box
      component="pre"
      sx={{
        margin: 0,
        padding: 2,
        overflow: 'auto',
        fontSize: '0.875rem',
        lineHeight: 1.6,
        fontFamily: '"Fira Code", "Consolas", "Monaco", "Andale Mono", "Ubuntu Mono", monospace',
        '& .keyword': {
          color: '#c678dd',
          fontWeight: 600,
        },
        '& .string': {
          color: '#98c379',
        },
        '& .number': {
          color: '#d19a66',
        },
        '& .comment': {
          color: '#5c6370',
          fontStyle: 'italic',
        },
        '& .function': {
          color: '#61afef',
        },
        '& .tag': {
          color: '#e06c75',
        },
        '& .attribute': {
          color: '#d19a66',
        },
        '& .type': {
          color: '#e5c07b',
        },
        '& .property': {
          color: '#e06c75',
        },
        // Dark theme
        ...((theme) => theme.palette.mode === 'dark' && {
          backgroundColor: '#282c34',
          color: '#abb2bf',
        }),
        // Light theme
        ...((theme) => theme.palette.mode === 'light' && {
          backgroundColor: '#fafafa',
          color: '#383a42',
          '& .keyword': {
            color: '#a626a4',
          },
          '& .string': {
            color: '#50a14f',
          },
          '& .number': {
            color: '#986801',
          },
          '& .comment': {
            color: '#a0a1a7',
          },
          '& .function': {
            color: '#4078f2',
          },
          '& .tag': {
            color: '#e45649',
          },
          '& .attribute': {
            color: '#986801',
          },
          '& .type': {
            color: '#c18401',
          },
          '& .property': {
            color: '#e45649',
          },
        }),
      }}
    >
      <code dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
    </Box>
  );
};