import React, { useState, useEffect, useRef } from 'react';
import aiService from '../../services/aiService';
import axios from 'axios';

const AIAssistant = ({ user }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studyData, setStudyData] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const chatEndRef = useRef(null);

  // Study Plan Form State
  const [planForm, setPlanForm] = useState({
    subjects: '',
    timeAvailable: '',
    goals: ''
  });

  // Quiz Form State
  const [quizForm, setQuizForm] = useState({
    topic: '',
    difficulty: 'medium',
    questionCount: 5
  });

  useEffect(() => {
    fetchStudyData();
    // Add welcome message
    setChatMessages([
      {
        type: 'ai',
        content: `Hello ${user?.name || 'there'}! 👋 I'm your AI Study Assistant powered by OpenAI. I can help you with study planning, learning techniques, motivation, and creating custom quizzes. How can I assist you today?`,
        timestamp: new Date(),
        source: 'openai'
      }
    ]);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchStudyData = async () => {
    try {
      const response = await axios.get('/study-sessions');
      setStudyData(response.data);
    } catch (error) {
      console.error('Error fetching study data:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const context = {
        totalSessions: studyData?.length || 0,
        userName: user?.name,
        recentSubjects: studyData?.slice(0, 5).map(s => s.subject) || []
      };

      const response = await aiService.chatWithAssistant(inputMessage, context);

      const aiMessage = {
        type: 'ai',
        content: response.message,
        timestamp: new Date(),
        mock: response.mock
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        error: true
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateStudyPlan = async () => {
    if (!planForm.subjects || !planForm.timeAvailable || !planForm.goals) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const subjects = planForm.subjects.split(',').map(s => s.trim());
      const response = await aiService.generateStudyPlan(
        subjects,
        parseInt(planForm.timeAvailable),
        planForm.goals
      );

      setStudyPlan(response);
    } catch (error) {
      console.error('Error generating study plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!quizForm.topic) {
      alert('Please enter a topic');
      return;
    }

    setIsLoading(true);
    try {
      const response = await aiService.generateQuiz(
        quizForm.topic,
        quizForm.difficulty,
        parseInt(quizForm.questionCount)
      );

      setQuiz(response.quiz);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setShowQuizResults(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizAnswer = (answerIndex) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowQuizResults(true);
    }
  };

  const calculateQuizScore = () => {
    if (!quiz || !userAnswers.length) return 0;
    const correct = userAnswers.filter((answer, index) =>
      answer === quiz.questions[index].correct
    ).length;
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const renderChatTab = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.error
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.source && (
                <p className="text-xs mt-1 opacity-70">
                  {message.source === 'openai' ? '🤖 Powered by OpenAI' :
                   message.source === 'intelligent_ai' ? '🧠 Intelligent AI' :
                   message.source === 'mock' ? '🔧 Demo mode' : ''}
                </p>
              )}
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="spinner-small"></div>
                <span className="text-gray-600 dark:text-gray-400">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about studying..."
            className="flex-1 input"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="btn btn-primary"
          >
            Send
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setInputMessage('Help me create a study plan')}
            className="text-xs bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
          >
            Study Plan
          </button>
          <button
            onClick={() => setInputMessage('Give me motivation tips')}
            className="text-xs bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded"
          >
            Motivation
          </button>
          <button
            onClick={() => setInputMessage('How can I improve my focus?')}
            className="text-xs bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded"
          >
            Focus Tips
          </button>
        </div>
      </div>
    </div>
  );

  const renderPlannerTab = () => (
    <div className="p-4 h-full overflow-y-auto">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📋 AI Study Planner
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Let AI create a personalized study plan based on your subjects, available time, and goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subjects (comma-separated)
              </label>
              <input
                type="text"
                value={planForm.subjects}
                onChange={(e) => setPlanForm({...planForm, subjects: e.target.value})}
                placeholder="Math, Physics, Chemistry"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hours available per week
              </label>
              <input
                type="number"
                value={planForm.timeAvailable}
                onChange={(e) => setPlanForm({...planForm, timeAvailable: e.target.value})}
                placeholder="20"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Goals & Objectives
              </label>
              <textarea
                value={planForm.goals}
                onChange={(e) => setPlanForm({...planForm, goals: e.target.value})}
                placeholder="Prepare for final exams, improve understanding of calculus..."
                className="input w-full h-20 resize-none"
              />
            </div>

            <button
              onClick={handleGenerateStudyPlan}
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Generating...' : 'Generate Study Plan'}
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {studyPlan ? (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Your AI-Generated Study Plan
                </h4>
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {studyPlan.message}
                </div>
                {studyPlan.source && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    {studyPlan.source === 'openai' ? '🤖 Generated by OpenAI' :
                     studyPlan.source === 'intelligent_ai' ? '🧠 Generated by Intelligent AI' :
                     studyPlan.source === 'mock' ? '🔧 Demo mode' : ''}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">📋</div>
                <p>Your AI-generated study plan will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuizTab = () => (
    <div className="p-4 h-full overflow-y-auto">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            ❓ AI Quiz Generator
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Generate custom quizzes on any topic to test your knowledge.
          </p>
        </div>

        {!quiz ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={quizForm.topic}
                  onChange={(e) => setQuizForm({...quizForm, topic: e.target.value})}
                  placeholder="Calculus derivatives"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty
                </label>
                <select
                  value={quizForm.difficulty}
                  onChange={(e) => setQuizForm({...quizForm, difficulty: e.target.value})}
                  className="input w-full"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Questions
                </label>
                <select
                  value={quizForm.questionCount}
                  onChange={(e) => setQuizForm({...quizForm, questionCount: e.target.value})}
                  className="input w-full"
                >
                  <option value="3">3 Questions</option>
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                </select>
              </div>

              <button
                onClick={handleGenerateQuiz}
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? 'Generating...' : 'Generate Quiz'}
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">❓</div>
              <p>Your AI-generated quiz will appear here</p>
            </div>
          </div>
        ) : !showQuizResults ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </h4>
              <button
                onClick={() => setQuiz(null)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                New Quiz
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                {quiz.questions[currentQuestionIndex].question}
              </h5>
              <div className="space-y-2">
                {quiz.questions[currentQuestionIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuizAnswer(index)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Quiz Results</h4>
              <button
                onClick={() => setQuiz(null)}
                className="btn btn-secondary"
              >
                New Quiz
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {calculateQuizScore()}%
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {userAnswers.filter((answer, index) => answer === quiz.questions[index].correct).length} out of {quiz.questions.length} correct
                </p>
              </div>

              <div className="space-y-3">
                {quiz.questions.map((question, index) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {index + 1}. {question.question}
                    </p>
                    <p className={`text-sm ${userAnswers[index] === question.correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Your answer: {question.options[userAnswers[index]]} {userAnswers[index] === question.correct ? '✓' : '✗'}
                    </p>
                    {userAnswers[index] !== question.correct && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Correct: {question.options[question.correct]}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {question.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="p-4 h-full overflow-y-auto">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📊 AI Study Insights
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get AI-powered analysis of your study patterns and personalized recommendations.
          </p>
        </div>

        <button
          onClick={async () => {
            if (!studyData) return;
            setIsLoading(true);
            try {
              const insights = await aiService.analyzeStudyPatterns(studyData);
              setChatMessages(prev => [...prev, {
                type: 'ai',
                content: insights.message,
                timestamp: new Date(),
                mock: insights.mock
              }]);
              setActiveTab('chat');
            } catch (error) {
              console.error('Error getting insights:', error);
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading || !studyData?.length}
          className="btn btn-primary"
        >
          {isLoading ? 'Analyzing...' : 'Analyze My Study Patterns'}
        </button>

        {studyData?.length ? (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Your Study Data Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Total Sessions</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{studyData.length}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Completed Sessions</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {studyData.filter(s => s.completed).length}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Unique Subjects</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {new Set(studyData.map(s => s.subject)).size}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">This Week</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {studyData.filter(s => {
                    const sessionDate = new Date(s.startTime);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return sessionDate > weekAgo;
                  }).length} sessions
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📊</div>
            <p>Complete some study sessions to get AI insights</p>
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: '💬' },
    { id: 'planner', label: 'Study Planner', icon: '📋' },
    { id: 'quiz', label: 'Quiz Generator', icon: '❓' },
    { id: 'insights', label: 'Study Insights', icon: '📊' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🤖 AI Assistant</h2>
        <p className="text-gray-600 dark:text-gray-400">Your intelligent study companion powered by AI</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-96">
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'planner' && renderPlannerTab()}
        {activeTab === 'quiz' && renderQuizTab()}
        {activeTab === 'insights' && renderInsightsTab()}
      </div>
    </div>
  );
};

export default AIAssistant;
