import React, { useMemo } from 'react';
import { Box, useTheme } from '@mui/material';

interface SyntaxHighlighterProps {
  code: string;
  language?: 'typescript' | 'javascript' | 'jsx' | 'tsx' | 'css' | 'json';
  showLineNumbers?: boolean;
  wrapLongLines?: boolean;
}

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  code,
  language = 'tsx',
  showLineNumbers = false,
  wrapLongLines = true,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const highlightedCode = useMemo(() => {
    const lines = code.split('\n');
    
    return lines.map((line, index) => {
      let highlighted = line;

      // Escape HTML
      highlighted = highlighted.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // Apply syntax highlighting patterns
      const patterns = [
        // Comments
        { regex: /(\/\/.*$)/, className: 'comment' },
        { regex: /(\/\*[\s\S]*?\*\/)/, className: 'comment' },
        
        // Strings
        { regex: /(["'])(?:(?=(\\?))\2.)*?\1/g, className: 'string' },
        { regex: /(`[^`]*`)/, className: 'template-string' },
        
        // JSX/TSX
        { regex: /(&lt;\/?)([A-Z]\w*)/, replacement: '$1<span class="component-tag">$2</span>' },
        { regex: /(&lt;\/?)([a-z]\w*)/, replacement: '$1<span class="html-tag">$2</span>' },
        { regex: /(\s)(\w+)(?=\s*=\s*[{"'])/g, replacement: '$1<span class="attribute">$2</span>' },
        
        // Keywords
        {
          regex: /\b(import|export|from|default|const|let|var|function|class|extends|implements|interface|type|enum|namespace|async|await|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|this|super|null|undefined|true|false|typeof|instanceof|void|delete|in|of|as|is|public|private|protected|static|readonly|abstract|override)\b/g,
          className: 'keyword',
        },
        
        // Types and interfaces
        { regex: /\b([A-Z]\w*)\b(?![\s]*[=:])/g, className: 'type' },
        
        // Numbers
        { regex: /\b(\d+\.?\d*)\b/g, className: 'number' },
        
        // Functions
        { regex: /\b(\w+)(?=\s*\()/g, className: 'function' },
        
        // Operators
        { regex: /(===|!==|==|!=|&lt;=|&gt;=|&lt;|&gt;|\+\+|--|&amp;&amp;|\|\||[+\-*/%=!?:])/g, className: 'operator' },
        
        // Decorators
        { regex: /(@\w+)/g, className: 'decorator' },
        
        // Property names in objects
        { regex: /(\w+)(?=\s*:)/g, className: 'property' },
      ];

      patterns.forEach(({ regex, className, replacement }) => {
        if (replacement) {
          highlighted = highlighted.replace(regex, replacement);
        } else if (className) {
          highlighted = highlighted.replace(regex, `<span class="${className}">$&</span>`);
        }
      });

      // Handle JSX expressions
      highlighted = highlighted.replace(/\{([^}]+)\}/g, (match, content) => {
        // Don't highlight if it's inside a string
        if (!match.includes('class=')) {
          return `<span class="jsx-expression">{${content}}</span>`;
        }
        return match;
      });

      return highlighted;
    });
  }, [code]);

  const syntaxTheme = {
    dark: {
      background: '#1e1e1e',
      color: '#d4d4d4',
      lineNumber: '#858585',
      comment: '#6a9955',
      string: '#ce9178',
      'template-string': '#ce9178',
      keyword: '#569cd6',
      number: '#b5cea8',
      operator: '#d4d4d4',
      function: '#dcdcaa',
      type: '#4ec9b0',
      'component-tag': '#4ec9b0',
      'html-tag': '#569cd6',
      attribute: '#9cdcfe',
      property: '#9cdcfe',
      decorator: '#dcdcaa',
      'jsx-expression': '#d4d4d4',
    },
    light: {
      background: '#ffffff',
      color: '#000000',
      lineNumber: '#237893',
      comment: '#008000',
      string: '#a31515',
      'template-string': '#a31515',
      keyword: '#0000ff',
      number: '#098658',
      operator: '#000000',
      function: '#795e26',
      type: '#267f99',
      'component-tag': '#267f99',
      'html-tag': '#800000',
      attribute: '#e50000',
      property: '#001080',
      decorator: '#795e26',
      'jsx-expression': '#000000',
    },
  };

  const currentTheme = isDark ? syntaxTheme.dark : syntaxTheme.light;

  return (
    <Box
      sx={{
        backgroundColor: currentTheme.background,
        color: currentTheme.color,
        padding: 2,
        borderRadius: 1,
        overflow: 'auto',
        fontSize: '0.875rem',
        lineHeight: 1.6,
        fontFamily: '"Fira Code", "Cascadia Code", "Consolas", "Monaco", monospace',
        fontVariantLigatures: 'contextual',
        whiteSpace: wrapLongLines ? 'pre-wrap' : 'pre',
        wordBreak: wrapLongLines ? 'break-word' : 'normal',
        '& .comment': { color: currentTheme.comment, fontStyle: 'italic' },
        '& .string': { color: currentTheme.string },
        '& .template-string': { color: currentTheme['template-string'] },
        '& .keyword': { color: currentTheme.keyword, fontWeight: 600 },
        '& .number': { color: currentTheme.number },
        '& .operator': { color: currentTheme.operator },
        '& .function': { color: currentTheme.function },
        '& .type': { color: currentTheme.type },
        '& .component-tag': { color: currentTheme['component-tag'], fontWeight: 600 },
        '& .html-tag': { color: currentTheme['html-tag'] },
        '& .attribute': { color: currentTheme.attribute },
        '& .property': { color: currentTheme.property },
        '& .decorator': { color: currentTheme.decorator, fontWeight: 600 },
        '& .jsx-expression': { color: currentTheme['jsx-expression'] },
      }}
    >
      {showLineNumbers ? (
        <table style={{ borderSpacing: 0, width: '100%' }}>
          <tbody>
            {highlightedCode.map((line, index) => (
              <tr key={index}>
                <td
                  style={{
                    textAlign: 'right',
                    paddingRight: '1em',
                    userSelect: 'none',
                    opacity: 0.5,
                    width: '1%',
                    whiteSpace: 'nowrap',
                    color: currentTheme.lineNumber,
                  }}
                >
                  {index + 1}
                </td>
                <td>
                  <pre style={{ margin: 0 }}>
                    <code dangerouslySetInnerHTML={{ __html: line }} />
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <pre style={{ margin: 0 }}>
          <code dangerouslySetInnerHTML={{ __html: highlightedCode.join('\n') }} />
        </pre>
      )}
    </Box>
  );
};