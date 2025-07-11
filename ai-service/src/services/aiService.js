const logger = require('../utils/logger');
const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  async reviewCode(code, language, fileName = 'untitled') {
    try {
      const prompt = this.buildReviewPrompt(code, language, fileName);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const review = result.response.text();
      return this.parseReviewResponse(review);
    } catch (error) {
      logger.error('AI review error:', error);
      // Always return a fallback structure so the frontend never crashes
      return this.createFallbackResponse('Error: ' + (error?.message || 'Unknown error'));
    }
  }

  buildReviewPrompt(code, language, fileName) {
    return `
Please review the following ${language} code from file "${fileName}":

\`\`\`${language}
${code}
\`\`\`

Please provide a comprehensive review including:

1. **Code Quality**: Structure, readability, maintainability
2. **Security**: Potential vulnerabilities and security issues
3. **Performance**: Optimization opportunities and bottlenecks
4. **Best Practices**: Adherence to ${language} conventions and patterns
5. **Bug Detection**: Potential bugs or logical errors
6. **Suggestions**: Specific improvements with examples

Format your response as JSON with the following structure:
{
  "overall_score": 1-10,
  "summary": "Brief overall assessment",
  "issues": [
    {
      "type": "security|performance|bug|style|best_practice",
      "severity": "error|warning|info",
      "line": number or null,
      "message": "Description of the issue",
      "suggestion": "How to fix it"
    }
  ],
  "recommendations": [
    "General recommendation 1",
    "General recommendation 2"
  ],
  "compliments": [
    "What was done well"
  ]
}

Provide specific, actionable feedback.
`;
  }

  parseReviewResponse(review) {
    try {
      const jsonMatch = review.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Defensive: always return all fields, with correct types
        return {
          overall_score: typeof parsed.overall_score === 'number' ? parsed.overall_score : 7,
          summary: typeof parsed.summary === 'string' ? parsed.summary : '',
          issues: Array.isArray(parsed.issues) ? parsed.issues : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          compliments: Array.isArray(parsed.compliments) ? parsed.compliments : []
        };
      }
      return this.parseManualResponse(review);
    } catch (error) {
      logger.error('Parse error:', error);
      return this.createFallbackResponse(review);
    }
  }

  parseManualResponse(review) {
    const lines = review.split('\n');
    const issues = [];
    const recommendations = [];
    let currentSection = null;

    lines.forEach(line => {
      if (line.includes('**Issues**') || line.includes('**Problems**')) {
        currentSection = 'issues';
      } else if (line.includes('**Recommendations**') || line.includes('**Suggestions**')) {
        currentSection = 'recommendations';
      } else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const content = line.trim().substring(1).trim();
        if (currentSection === 'issues') {
          issues.push({
            type: 'general',
            severity: 'warning',
            line: null,
            message: content,
            suggestion: 'Please review this issue'
          });
        } else if (currentSection === 'recommendations') {
          recommendations.push(content);
        }
      }
    });

    // Always return all required fields with correct types
    return {
      overall_score: 7,
      summary: 'AI review completed',
      issues: Array.isArray(issues) ? issues : [],
      recommendations: Array.isArray(recommendations) ? recommendations : [],
      compliments: []
    };
  }

  createFallbackResponse(review) {
    return {
      overall_score: 7,
      summary: 'Review completed with basic analysis',
      issues: [{
        type: 'general',
        severity: 'info',
        line: null,
        message: 'Please review the code manually',
        suggestion: typeof review === 'string' ? review.substring(0, 200) + '...' : 'No details available'
      }],
      recommendations: ['Manual review recommended'],
      compliments: []
    };
  }

  async explainCode(code, language) {
    try {
      const prompt = `Explain what this ${language} code does:\n\n\`\`\`${language}\n${code}\n\`\`\``;
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      logger.error('Code explanation error:', error);
      throw new Error('Failed to explain code');
    }
  }
}

module.exports = new AIService();