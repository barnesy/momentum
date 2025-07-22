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
    
    return lines.map((line) => {
      // Escape HTML
      let highlighted = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // Create a map to track already highlighted sections
      const replacements: Array<{ start: number; end: number; html: string }> = [];
      
      // Helper to add replacement
      const addReplacement = (match: RegExpExecArray, html: string) => {
        replacements.push({
          start: match.index!,
          end: match.index! + match[0].length,
          html
        });
      };

      // First pass: Find strings and comments (highest priority)
      const stringRegex = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
      let match;
      while ((match = stringRegex.exec(highlighted)) !== null) {
        addReplacement(match, `<span class="string">${match[0]}</span>`);
      }

      // Comments
      const commentRegex = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)/g;
      while ((match = commentRegex.exec(highlighted)) !== null) {
        addReplacement(match, `<span class="comment">${match[0]}</span>`);
      }

      // Check if position is already highlighted
      const isHighlighted = (start: number, end: number) => {
        return replacements.some(r => 
          (start >= r.start && start < r.end) || 
          (end > r.start && end <= r.end) ||
          (start <= r.start && end >= r.end)
        );
      };

      // Second pass: Keywords (skip if inside strings/comments)
      const keywordRegex = /\b(import|export|from|default|const|let|var|function|class|extends|implements|interface|type|enum|namespace|async|await|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|this|super|null|undefined|true|false|typeof|instanceof|void|delete|in|of|as|is|public|private|protected|static|readonly|abstract|override)\b/g;
      while ((match = keywordRegex.exec(highlighted)) !== null) {
        if (!isHighlighted(match.index!, match.index! + match[0].length)) {
          addReplacement(match, `<span class="keyword">${match[0]}</span>`);
        }
      }

      // JSX/TSX tags
      const jsxTagRegex = /(&lt;\/?)([A-Za-z]\w*)/g;
      while ((match = jsxTagRegex.exec(highlighted)) !== null) {
        if (!isHighlighted(match.index!, match.index! + match[0].length)) {
          const tagClass = match[2][0] === match[2][0].toUpperCase() ? 'component-tag' : 'html-tag';
          addReplacement(match, `${match[1]}<span class="${tagClass}">${match[2]}</span>`);
        }
      }

      // Types
      const typeRegex = /\b([A-Z]\w*)\b(?![\s]*[=:])/g;
      while ((match = typeRegex.exec(highlighted)) !== null) {
        if (!isHighlighted(match.index!, match.index! + match[0].length)) {
          addReplacement(match, `<span class="type">${match[0]}</span>`);
        }
      }

      // Numbers
      const numberRegex = /\b(\d+\.?\d*)\b/g;
      while ((match = numberRegex.exec(highlighted)) !== null) {
        if (!isHighlighted(match.index!, match.index! + match[0].length)) {
          addReplacement(match, `<span class="number">${match[0]}</span>`);
        }
      }

      // Properties in objects
      const propertyRegex = /(\w+)(?=\s*:)/g;
      while ((match = propertyRegex.exec(highlighted)) !== null) {
        if (!isHighlighted(match.index!, match.index! + match[0].length)) {
          addReplacement(match, `<span class="property">${match[0]}</span>`);
        }
      }

      // Attributes in JSX
      const attributeRegex = /(?<=\s)(\w+)(?=\s*=\s*[{"'])/g;
      while ((match = attributeRegex.exec(highlighted)) !== null) {
        if (!isHighlighted(match.index!, match.index! + match[0].length)) {
          addReplacement(match, `<span class="attribute">${match[0]}</span>`);
        }
      }

      // Sort replacements by position (reverse order)
      replacements.sort((a, b) => b.start - a.start);

      // Apply replacements
      for (const { start, end, html } of replacements) {
        highlighted = highlighted.slice(0, start) + html + highlighted.slice(end);
      }

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