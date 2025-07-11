const { ESLint } = require('eslint');
const logger = require('../utils/logger');

class StaticAnalysisService {
  constructor() {
    this.eslint = new ESLint({
      baseConfig: {
        extends: ['eslint:recommended'],
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: 'module'
        },
        env: {
          node: true,
          browser: true,
          es2022: true
        }
      },
      useEslintrc: false
    });
  }

  async analyze(code, language) {
    try {
      const result = {
        issues: [],
        metrics: {
          linesOfCode: code.split('\n').length,
          complexity: this.calculateComplexity(code),
          duplicateLines: this.findDuplicateLines(code)
        }
      };

      // Run language-specific analysis
      if (language === 'javascript' || language === 'typescript') {
        const eslintResults = await this.runESLint(code);
        result.issues.push(...eslintResults);
      }

      // Run general analysis
      const generalIssues = this.analyzeGeneral(code, language);
      result.issues.push(...generalIssues);

      return result;
    } catch (error) {
      logger.error('Static analysis error:', error);
      return {
        issues: [],
        metrics: {
          linesOfCode: code.split('\n').length,
          complexity: 0,
          duplicateLines: 0
        }
      };
    }
  }

  async runESLint(code) {
    try {
      const results = await this.eslint.lintText(code);
      const issues = [];

      results.forEach(result => {
        result.messages.forEach(message => {
          issues.push({
            type: message.ruleId || 'eslint',
            severity: message.severity === 2 ? 'error' : 'warning',
            line: message.line,
            column: message.column,
            message: message.message,
            suggestion: this.getESLintSuggestion(message.ruleId)
          });
        });
      });

      return issues;
    } catch (error) {
      logger.error('ESLint error:', error);
      return [];
    }
  }

  analyzeGeneral(code, language) {
    const issues = [];
    const lines = code.split('\n');

    // Check for long lines
    lines.forEach((line, index) => {
      if (line.length > 120) {
        issues.push({
          type: 'style',
          severity: 'info',
          line: index + 1,
          message: `Line too long (${line.length} characters)`,
          suggestion: 'Consider breaking this line into multiple lines'
        });
      }
    });

    // Check for TODO/FIXME comments
    lines.forEach((line, index) => {
      if (line.match(/TODO|FIXME|XXX/i)) {
        issues.push({
          type: 'maintenance',
          severity: 'info',
          line: index + 1,
          message: 'TODO/FIXME comment found',
          suggestion: 'Consider addressing this comment'
        });
      }
    });

    // Check for console.log (JavaScript)
    if (language === 'javascript' || language === 'typescript') {
      lines.forEach((line, index) => {
        if (line.includes('console.log')) {
          issues.push({
            type: 'best_practice',
            severity: 'warning',
            line: index + 1,
            message: 'Console.log statement found',
            suggestion: 'Remove console.log statements before production'
          });
        }
      });
    }

    // Check for potential security issues
    const securityPatterns = [
      { pattern: /eval\s*\(/, message: 'Use of eval() is dangerous' },
      { pattern: /document\.write\s*\(/, message: 'Use of document.write() is not recommended' },
      { pattern: /innerHTML\s*=/, message: 'Direct innerHTML assignment can be dangerous' }
    ];

    securityPatterns.forEach(({ pattern, message }) => {
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          issues.push({
            type: 'security',
            severity: 'warning',
            line: index + 1,
            message,
            suggestion: 'Consider using safer alternatives'
          });
        }
      });
    });

    return issues;
  }

  calculateComplexity(code) {
    // Simple cyclomatic complexity calculation
    const complexityKeywords = [
      'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'catch', 'finally'
    ];
    
    let complexity = 1; // Base complexity
    const words = code.split(/\s+/);
    
    words.forEach(word => {
      if (complexityKeywords.includes(word)) {
        complexity++;
      }
    });

    return complexity;
  }

  findDuplicateLines(code) {
    const lines = code.split('\n');
    const lineCount = {};
    let duplicates = 0;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && trimmed.length > 10) {
        lineCount[trimmed] = (lineCount[trimmed] || 0) + 1;
        if (lineCount[trimmed] === 2) {
          duplicates++;
        }
      }
    });

    return duplicates;
  }

  getESLintSuggestion(ruleId) {
    const suggestions = {
      'no-unused-vars': 'Remove unused variables or use them appropriately',
      'no-console': 'Remove console statements or use a proper logging library',
      'eqeqeq': 'Use === instead of == for strict equality',
      'curly': 'Always use curly braces for control statements',
      'no-undef': 'Define variables before using them',
      'semi': 'Add semicolons at the end of statements'
    };

    return suggestions[ruleId] || 'Follow ESLint recommendations';
  }
}

module.exports = new StaticAnalysisService();