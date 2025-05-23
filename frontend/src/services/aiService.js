// AI Service for SmartStudy
// Multi-mode AI integration: Python AI Service, OpenAI API, and Demo Mode

const OPENAI_API_BASE = 'https://api.openai.com/v1';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const PYTHON_AI_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5001';
const USE_PYTHON_AI = import.meta.env.VITE_USE_PYTHON_AI !== 'false'; // Default to true

class AIService {
  constructor() {
    this.openaiApiKey = OPENAI_API_KEY;
    this.openaiBaseURL = OPENAI_API_BASE;
    this.pythonAiURL = PYTHON_AI_URL;
    this.usePythonAI = USE_PYTHON_AI;

    // Only log in development mode
    if (import.meta.env.DEV) {
      console.log('AI Service Configuration:', {
        usePythonAI: this.usePythonAI,
        pythonAiURL: this.pythonAiURL,
        hasOpenAIKey: !!this.openaiApiKey
      });
    }
  }

  async makePythonAIRequest(endpoint, data) {
    try {
      const response = await fetch(`${this.pythonAiURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Python AI Service Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Python AI Service Error:', error);
      }
      throw error;
    }
  }

  async makeOpenAIRequest(messages, maxTokens = 500) {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file');
    }

    try {
      const response = await fetch(`${this.openaiBaseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: maxTokens,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('OpenAI API Error:', error);
      }
      throw error;
    }
  }

  getDemoResponse(type, context = {}) {
    const demoResponses = {
      chat: [
        "I'm here to help you with your studies! Try using the Pomodoro Technique: 25 minutes of focused study followed by a 5-minute break.",
        "Great question! For better retention, try active recall - test yourself without looking at your notes.",
        "I recommend spaced repetition for long-term learning. Review material at increasing intervals.",
        "Consider creating mind maps to visualize connections between concepts. It's very effective!",
        "Break complex topics into smaller, manageable chunks. This makes learning less overwhelming."
      ],
      studyPlan: `📅 **Demo Study Plan (10h/week)**

🎯 **Goals**: Improve academic performance

📚 **Subject Allocation**:
**Math**: 3h/week
  - Monday: 1.5h (New concepts)
  - Wednesday: 1.5h (Practice & review)

**Science**: 3h/week
  - Tuesday: 1.5h (New concepts)
  - Thursday: 1.5h (Practice & review)

**English**: 4h/week
  - Friday: 2h (New concepts)
  - Sunday: 2h (Practice & review)

💡 **Recommended Techniques**:
- Active recall and spaced repetition
- Pomodoro Technique (25min focus + 5min break)
- Practice problems and application

📈 **Weekly Milestones**:
- Week 1: Foundation building and concept understanding
- Week 2: Practice application and problem-solving
- Week 3: Review, assessment, and knowledge consolidation
- Week 4: Advanced topics and comprehensive review

⏰ **Optimal Study Times**:
- Morning (9-11 AM): Complex problem-solving
- Afternoon (2-4 PM): Review and practice
- Evening (7-9 PM): Light reading and revision`,

      analysis: `📊 **Demo Study Pattern Analysis**

✅ **Strengths Identified**:
- Good consistency in study sessions
- Balanced subject coverage
- Regular completion of planned sessions

🎯 **Optimization Opportunities**:
- Consider longer study sessions for better focus
- Add more review sessions for retention
- Try different study techniques

💡 **AI Recommendations**:
- Use spaced repetition for better retention
- Schedule regular review sessions
- Try the Feynman Technique for complex topics

⏰ **Predicted Optimal Study Times**:
- Peak focus: 9-11 AM (based on cognitive research)
- Good for review: 2-4 PM
- Light study: 7-8 PM

🌟 **Progress Celebration**:
You're building great study habits! Keep up the momentum and stay consistent with your learning goals.`
    };

    if (type === 'chat') {
      return demoResponses.chat[Math.floor(Math.random() * demoResponses.chat.length)];
    }
    return demoResponses[type] || "I'm here to help with your studies!";
  }

  // AI Study Assistant - Chat with AI about study topics
  async chatWithAssistant(message, context = {}) {
    // Try Python AI Service first (if enabled)
    if (this.usePythonAI) {
      try {
        const response = await this.makePythonAIRequest('/chat', {
          message,
          context
        });
        return {
          success: true,
          message: response.message,
          source: 'python-ai',
          type: response.type
        };
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Python AI Service failed, trying OpenAI API...', error);
        }
      }
    }

    // Try OpenAI API as fallback
    if (this.openaiApiKey) {
      try {
        const messages = [
          {
            role: 'system',
            content: `You are a helpful AI study assistant for a SmartStudy app. Help users with:
            - Study planning and scheduling
            - Learning techniques and strategies
            - Subject-specific guidance
            - Motivation and productivity tips
            - Spaced repetition optimization

            User context: ${JSON.stringify(context)}

            Keep responses concise, helpful, and encouraging. Focus on actionable advice.`
          },
          {
            role: 'user',
            content: message
          }
        ];

        const response = await this.makeOpenAIRequest(messages);
        return {
          success: true,
          message: response,
          source: 'openai'
        };
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('OpenAI API failed, using demo mode...', error);
        }
      }
    }

    // Fallback to demo mode
    return {
      success: true,
      message: this.getDemoResponse('chat', context),
      source: 'demo',
      mock: true
    };
  }

  // Generate AI-powered study plan
  async generateStudyPlan(subjects, timeAvailable, goals) {
    const subjectList = Array.isArray(subjects) ? subjects.join(', ') : subjects;

    // Try Python AI Service first (if enabled)
    if (this.usePythonAI) {
      try {
        const response = await this.makePythonAIRequest('/study-plan', {
          subjects: subjectList,
          timeAvailable,
          goals
        });
        return {
          success: true,
          message: response.message,
          source: 'python-ai',
          subjects: response.subjects,
          weekly_hours: response.weekly_hours
        };
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Python AI Service failed, trying OpenAI API...', error);
        }
      }
    }

    // Try OpenAI API as fallback
    if (this.openaiApiKey) {
      try {
        const messages = [
          {
            role: 'system',
            content: 'You are an expert study planner. Create detailed, personalized study plans with specific time allocations, techniques, and milestones.'
          },
          {
            role: 'user',
            content: `Create a personalized study plan with these details:
            - Subjects: ${subjectList}
            - Time available: ${timeAvailable} hours per week
            - Goals: ${goals}

            Provide a structured weekly plan with specific time allocations, study techniques, and milestones.`
          }
        ];

        const response = await this.makeOpenAIRequest(messages, 800);
        return {
          success: true,
          message: response,
          source: 'openai'
        };
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('OpenAI API failed, using demo mode...', error);
        }
      }
    }

    // Fallback to demo mode
    return {
      success: true,
      message: this.getDemoResponse('studyPlan'),
      source: 'demo',
      mock: true
    };
  }

  // Generate quiz questions from study material
  async generateQuiz(topic, difficulty = 'medium', questionCount = 5) {
    // Try Python AI Service first (if enabled)
    if (this.usePythonAI) {
      try {
        const response = await this.makePythonAIRequest('/quiz', {
          topic,
          difficulty,
          questionCount
        });
        return {
          success: true,
          quiz: response.quiz,
          source: 'python-ai'
        };
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Python AI Service failed, trying OpenAI API...', error);
        }
      }
    }

    // Try OpenAI API as fallback
    if (this.openaiApiKey) {
      try {
        const messages = [
          {
            role: 'system',
            content: 'You are an expert quiz generator. Create educational quiz questions with multiple choice answers and explanations. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: `Generate ${questionCount} ${difficulty} difficulty quiz questions about "${topic}".
            Format as JSON with this structure:
            {
              "questions": [
                {
                  "question": "Question text",
                  "options": ["A", "B", "C", "D"],
                  "correct": 0,
                  "explanation": "Why this is correct"
                }
              ]
            }`
          }
        ];

        const response = await this.makeOpenAIRequest(messages, 800);
        const quizData = JSON.parse(response);

        return {
          success: true,
          quiz: {
            topic,
            difficulty,
            questions: quizData.questions
          },
          source: 'openai'
        };
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('OpenAI API failed, using demo mode...', error);
        }
      }
    }

    // Fallback to demo mode
    const demoQuiz = {
      topic,
      difficulty,
      questions: [
        {
          question: `What is a key concept in ${topic}?`,
          options: ["Fundamental principle", "Basic application", "Advanced theory", "Complex integration"],
          correct: 0,
          explanation: `Understanding fundamental principles is essential for mastering ${topic}.`
        },
        {
          question: `How would you apply ${topic} in practice?`,
          options: ["Through memorization", "By solving problems", "Reading only", "Avoiding practice"],
          correct: 1,
          explanation: `Active problem-solving is the best way to apply knowledge in ${topic}.`
        },
        {
          question: `What makes ${topic} challenging for students?`,
          options: ["Too easy", "Abstract concepts", "No applications", "Simple formulas"],
          correct: 1,
          explanation: `Abstract concepts in ${topic} require practice and visualization to understand.`
        }
      ].slice(0, parseInt(questionCount))
    };

    return {
      success: true,
      quiz: demoQuiz,
      source: 'demo',
      mock: true
    };
  }

  // Analyze study patterns and provide insights
  async analyzeStudyPatterns(studyData) {
    // Try Python AI Service first (if enabled)
    if (this.usePythonAI) {
      try {
        const response = await this.makePythonAIRequest('/analyze', {
          studyData
        });
        return {
          success: true,
          message: response.message,
          source: 'python-ai',
          confidence: response.confidence,
          recommendations_count: response.recommendations_count
        };
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Python AI Service failed, trying OpenAI API...', error);
        }
      }
    }

    // Try OpenAI API as fallback
    if (this.openaiApiKey) {
      try {
        const messages = [
          {
            role: 'system',
            content: 'You are an expert learning analyst. Analyze study patterns and provide actionable insights and recommendations.'
          },
          {
            role: 'user',
            content: `Analyze this study data and provide insights:
            ${JSON.stringify(studyData)}

            Provide:
            1. Strengths in study habits
            2. Areas for improvement
            3. Specific recommendations
            4. Optimal study times based on patterns`
          }
        ];

        const response = await this.makeOpenAIRequest(messages, 800);
        return {
          success: true,
          message: response,
          source: 'openai'
        };
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('OpenAI API failed, using demo mode...', error);
        }
      }
    }

    // Fallback to demo mode
    return {
      success: true,
      message: this.getDemoResponse('analysis', studyData),
      source: 'demo',
      mock: true
    };
  }

}

export default new AIService();
