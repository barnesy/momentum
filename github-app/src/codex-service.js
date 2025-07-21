import OpenAI from 'openai';
import { config } from 'dotenv';
import chalk from 'chalk';

config();

export class CodexService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.model = 'gpt-3.5-turbo';
    this.codeModel = 'gpt-3.5-turbo'; // Codex is deprecated, using GPT-3.5 for code
    
    this.initialized = !!process.env.OPENAI_API_KEY;
    
    if (!this.initialized) {
      console.warn(chalk.yellow('⚠️  OpenAI API key not found. Code suggestions disabled.'));
    }
  }

  async getSuggestions(context) {
    if (!this.initialized) {
      return { error: 'OpenAI API key not configured' };
    }

    try {
      const { code, language, prompt, cursor } = context;
      
      const systemPrompt = `You are an expert code assistant integrated into the Momentum development system. 
Provide helpful, concise code suggestions based on the context. Focus on:
- Code completion at cursor position
- Bug fixes and improvements
- Performance optimizations
- Best practices for ${language || 'the detected language'}`;

      const userPrompt = prompt || `Given this code context, suggest completions or improvements:

\`\`\`${language || ''}
${code}
\`\`\`

Cursor position: line ${cursor?.line || 'unknown'}, column ${cursor?.column || 'unknown'}`;

      const completion = await this.openai.chat.completions.create({
        model: this.codeModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      return {
        suggestions: completion.choices[0].message.content,
        usage: completion.usage,
        model: this.codeModel
      };
    } catch (error) {
      console.error(chalk.red('Codex error:'), error);
      return { error: error.message };
    }
  }

  async analyzeCode(code, options = {}) {
    if (!this.initialized) {
      return { error: 'OpenAI API key not configured' };
    }

    try {
      const { 
        checkFor = ['bugs', 'performance', 'security', 'best-practices'],
        language,
        context
      } = options;

      const systemPrompt = `You are a code analysis expert. Analyze the provided code for:
${checkFor.map(check => `- ${check}`).join('\n')}

Provide specific, actionable feedback with line numbers where applicable.`;

      const userPrompt = `Analyze this ${language || ''} code:

\`\`\`${language || ''}
${code}
\`\`\`

${context ? `Additional context: ${context}` : ''}`;

      const analysis = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      return {
        analysis: analysis.choices[0].message.content,
        usage: analysis.usage,
        model: this.model
      };
    } catch (error) {
      console.error(chalk.red('Code analysis error:'), error);
      return { error: error.message };
    }
  }

  async explainCode(code, options = {}) {
    if (!this.initialized) {
      return { error: 'OpenAI API key not configured' };
    }

    try {
      const { language, level = 'intermediate' } = options;

      const systemPrompt = `You are a patient coding teacher. Explain the provided code clearly for a ${level} developer.
Break down complex concepts, explain the purpose and flow, and highlight important patterns.`;

      const userPrompt = `Explain this ${language || ''} code:

\`\`\`${language || ''}
${code}
\`\`\``;

      const explanation = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 2000
      });

      return {
        explanation: explanation.choices[0].message.content,
        usage: explanation.usage,
        model: this.model
      };
    } catch (error) {
      console.error(chalk.red('Code explanation error:'), error);
      return { error: error.message };
    }
  }

  async generateTests(code, options = {}) {
    if (!this.initialized) {
      return { error: 'OpenAI API key not configured' };
    }

    try {
      const { 
        language,
        framework = 'jest',
        style = 'unit'
      } = options;

      const systemPrompt = `You are a test-driven development expert. Generate comprehensive ${style} tests for the provided code using ${framework}.
Include edge cases, error scenarios, and ensure good coverage.`;

      const userPrompt = `Generate ${style} tests for this ${language || ''} code:

\`\`\`${language || ''}
${code}
\`\`\``;

      const tests = await this.openai.chat.completions.create({
        model: this.codeModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      return {
        tests: tests.choices[0].message.content,
        usage: tests.usage,
        model: this.codeModel
      };
    } catch (error) {
      console.error(chalk.red('Test generation error:'), error);
      return { error: error.message };
    }
  }

  async refactorCode(code, options = {}) {
    if (!this.initialized) {
      return { error: 'OpenAI API key not configured' };
    }

    try {
      const { 
        language,
        goals = ['readability', 'performance', 'maintainability'],
        constraints = []
      } = options;

      const systemPrompt = `You are a code refactoring expert. Refactor the provided code to improve:
${goals.map(goal => `- ${goal}`).join('\n')}

${constraints.length ? `Constraints:\n${constraints.map(c => `- ${c}`).join('\n')}` : ''}

Provide the refactored code with brief explanations of changes.`;

      const userPrompt = `Refactor this ${language || ''} code:

\`\`\`${language || ''}
${code}
\`\`\``;

      const refactored = await this.openai.chat.completions.create({
        model: this.codeModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      return {
        refactored: refactored.choices[0].message.content,
        usage: refactored.usage,
        model: this.codeModel
      };
    } catch (error) {
      console.error(chalk.red('Refactoring error:'), error);
      return { error: error.message };
    }
  }

  // Real-time code completion for IDE integration
  async getCompletion(prefix, suffix = '', options = {}) {
    if (!this.initialized) {
      return { error: 'OpenAI API key not configured' };
    }

    try {
      const { 
        language,
        maxTokens = 150,
        temperature = 0.2
      } = options;

      const prompt = `Complete the following ${language || ''} code:

${prefix}
[CURSOR]
${suffix}

Provide only the code that should be inserted at [CURSOR], nothing else.`;

      const completion = await this.openai.chat.completions.create({
        model: this.codeModel,
        messages: [
          { role: 'system', content: 'You are a code completion engine. Provide only the missing code, no explanations.' },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens,
        stop: ['\n\n', '```']
      });

      return {
        completion: completion.choices[0].message.content.trim(),
        usage: completion.usage,
        model: this.codeModel
      };
    } catch (error) {
      console.error(chalk.red('Completion error:'), error);
      return { error: error.message };
    }
  }

  // Pattern detection for common issues
  async detectPatterns(code, patterns = []) {
    if (!this.initialized) {
      return { error: 'OpenAI API key not configured' };
    }

    try {
      const defaultPatterns = [
        'security vulnerabilities',
        'performance bottlenecks',
        'memory leaks',
        'race conditions',
        'deprecated APIs',
        'accessibility issues'
      ];

      const searchPatterns = patterns.length ? patterns : defaultPatterns;

      const systemPrompt = `You are a code pattern detection expert. Analyze the code for these specific patterns:
${searchPatterns.map(p => `- ${p}`).join('\n')}

For each detected pattern, provide:
1. Pattern type
2. Location (line numbers)
3. Severity (low/medium/high)
4. Suggested fix`;

      const analysis = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this code:\n\n\`\`\`\n${code}\n\`\`\`` }
        ],
        temperature: 0.2,
        max_tokens: 2000
      });

      return {
        patterns: analysis.choices[0].message.content,
        usage: analysis.usage,
        model: this.model
      };
    } catch (error) {
      console.error(chalk.red('Pattern detection error:'), error);
      return { error: error.message };
    }
  }
}

// Singleton instance
export const codexService = new CodexService();