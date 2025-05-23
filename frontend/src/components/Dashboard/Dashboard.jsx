import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateSessionModal from '../StudySessions/CreateSessionModal';

const Dashboard = ({ user, onNavigate }) => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    todaySessions: 0,
    upcomingReminders: 0,
    completedSessions: 0
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [sessionsResponse, remindersResponse] = await Promise.all([
        axios.get('/study-sessions'),
        axios.get('/study-sessions/reminders')
      ]);

      const sessions = sessionsResponse.data;
      const reminders = remindersResponse.data;

      // Calculate stats
      const today = new Date().toDateString();
      const todaySessions = sessions.filter(session =>
        new Date(session.startTime).toDateString() === today
      ).length;

      const completedSessions = sessions.filter(session => session.completed).length;

      setStats({
        totalSessions: sessions.length,
        todaySessions,
        upcomingReminders: reminders.length,
        completedSessions
      });

      // Get recent sessions (last 5)
      const sortedSessions = sessions
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        .slice(0, 5);

      setRecentSessions(sortedSessions);
      setUpcomingReminders(reminders.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleCreateSession = async (sessionData) => {
    try {
      const response = await axios.post('/study-sessions', sessionData);
      // Refresh dashboard data to show the new session
      fetchDashboardData();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'newSession':
        setShowCreateModal(true);
        break;
      case 'analytics':
        if (onNavigate) onNavigate('analytics');
        break;
      case 'calendar':
        if (onNavigate) onNavigate('calendar');
        break;
      case 'reminders':
        if (onNavigate) onNavigate('reminders');
        break;
      case 'ai-assistant':
        if (onNavigate) onNavigate('ai-assistant');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {getGreeting()}, {user.name}! 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Ready to continue your learning journey? Here's your study overview for today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Sessions</p>
              <p className="text-2xl lg:text-3xl font-bold">{stats.totalSessions}</p>
            </div>
            <div className="text-3xl lg:text-4xl opacity-80">📚</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Today's Sessions</p>
              <p className="text-2xl lg:text-3xl font-bold">{stats.todaySessions}</p>
            </div>
            <div className="text-3xl lg:text-4xl opacity-80">📅</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending Reminders</p>
              <p className="text-2xl lg:text-3xl font-bold">{stats.upcomingReminders}</p>
            </div>
            <div className="text-3xl lg:text-4xl opacity-80">🔔</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Completed</p>
              <p className="text-2xl lg:text-3xl font-bold">{stats.completedSessions}</p>
            </div>
            <div className="text-3xl lg:text-4xl opacity-80">✅</div>
          </div>
        </div>
      </div>

      {/* Recent Sessions and Upcoming Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Study Sessions</h3>
          </div>
          <div className="space-y-3">
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <div key={session._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{session.subject}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{session.topic}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(session.startTime)}</p>
                  </div>
                  <div className={`badge ${session.completed ? 'badge-success' : 'badge-warning'}`}>
                    {session.completed ? 'Completed' : 'In Progress'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📚</div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">No recent sessions</p>
                <button
                  onClick={() => handleQuickAction('newSession')}
                  className="btn btn-primary btn-sm"
                >
                  <span className="mr-2">➕</span>
                  Create Your First Session
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upcoming Reminders</h3>
          </div>
          <div className="space-y-3">
            {upcomingReminders.length > 0 ? (
              upcomingReminders.map((reminder) => (
                <div key={reminder._id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{reminder.subject}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{reminder.topic}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Due: {formatDate(reminder.nextRevision)}</p>
                  </div>
                  <div className="text-2xl">⏰</div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming reminders</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Get started with common tasks</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <button
            onClick={() => handleQuickAction('newSession')}
            className="btn btn-primary hover:scale-105 transform transition-all duration-200 shadow-md hover:shadow-lg text-sm lg:text-base"
          >
            <span className="mr-2">➕</span>
            New Study Session
          </button>
          <button
            onClick={() => handleQuickAction('ai-assistant')}
            className="btn btn-primary hover:scale-105 transform transition-all duration-200 shadow-md hover:shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm lg:text-base"
          >
            <span className="mr-2">🤖</span>
            AI Assistant
          </button>
          <button
            onClick={() => handleQuickAction('analytics')}
            className="btn btn-secondary hover:scale-105 transform transition-all duration-200 shadow-md hover:shadow-lg text-sm lg:text-base"
          >
            <span className="mr-2">📊</span>
            View Analytics
          </button>
          <button
            onClick={() => handleQuickAction('calendar')}
            className="btn btn-secondary hover:scale-105 transform transition-all duration-200 shadow-md hover:shadow-lg text-sm lg:text-base"
          >
            <span className="mr-2">📅</span>
            Open Calendar
          </button>
        </div>

        {/* AI Features Section */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            🤖 AI-Powered Features
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => handleQuickAction('ai-assistant')}
              className="text-left p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
            >
              <div className="text-xl lg:text-2xl mb-1">💬</div>
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm lg:text-base">AI Chat</div>
              <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Get study advice and tips</div>
            </button>
            <button
              onClick={() => handleQuickAction('ai-assistant')}
              className="text-left p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
            >
              <div className="text-xl lg:text-2xl mb-1">📋</div>
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm lg:text-base">Study Planner</div>
              <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Generate personalized plans</div>
            </button>
            <button
              onClick={() => handleQuickAction('ai-assistant')}
              className="text-left p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
            >
              <div className="text-xl lg:text-2xl mb-1">❓</div>
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm lg:text-base">Quiz Generator</div>
              <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Create custom quizzes</div>
            </button>
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <CreateSessionModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSession}
        />
      )}
    </div>
  );
};

export default Dashboard;
