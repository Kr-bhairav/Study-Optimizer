import React, { useState, useEffect } from 'react';
import axios from 'axios';
import aiService from '../../services/aiService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';

const Analytics = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/study-sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSessions = () => {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    return sessions.filter(session => new Date(session.startTime) >= startDate);
  };

  const calculateStats = () => {
    const filteredSessions = getFilteredSessions();

    const totalSessions = filteredSessions.length;
    const completedSessions = filteredSessions.filter(s => s.completed).length;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions * 100).toFixed(1) : 0;

    const totalStudyTime = filteredSessions.reduce((total, session) => {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      return total + (end - start);
    }, 0);

    const avgSessionLength = totalSessions > 0 ? totalStudyTime / totalSessions : 0;

    // Subject breakdown
    const subjectStats = {};
    filteredSessions.forEach(session => {
      if (!subjectStats[session.subject]) {
        subjectStats[session.subject] = { count: 0, totalTime: 0, completed: 0 };
      }
      subjectStats[session.subject].count++;
      if (session.completed) {
        subjectStats[session.subject].completed++;
      }

      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      subjectStats[session.subject].totalTime += (end - start);
    });

    return {
      totalSessions,
      completedSessions,
      completionRate,
      totalStudyTime,
      avgSessionLength,
      subjectStats
    };
  };

  const formatDuration = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStudyStreak = () => {
    const sortedSessions = sessions
      .filter(s => s.completed)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    if (sortedSessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].startTime);
      sessionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate = new Date(sessionDate);
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  };

  const getWeeklyProgress = () => {
    const weekData = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStr = date.toDateString();

      const daySessions = sessions.filter(session =>
        new Date(session.startTime).toDateString() === dayStr
      );

      const totalTime = daySessions.reduce((total, session) => {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        return total + (end - start);
      }, 0);

      weekData.push({
        day: dayName,
        sessions: daySessions.length,
        timeHours: Math.round(totalTime / (1000 * 60 * 60) * 10) / 10, // Convert to hours with 1 decimal
        time: totalTime,
        completed: daySessions.filter(s => s.completed).length
      });
    }

    return weekData;
  };

  const getSubjectChartData = () => {
    const stats = calculateStats();
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

    return Object.entries(stats.subjectStats).map(([subject, data], index) => ({
      name: subject,
      value: Math.round(data.totalTime / (1000 * 60 * 60) * 10) / 10, // Hours
      sessions: data.count,
      color: colors[index % colors.length]
    }));
  };

  const getMonthlyProgress = () => {
    const monthData = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();

      const monthSessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate.getFullYear() === year && sessionDate.getMonth() === month;
      });

      const totalTime = monthSessions.reduce((total, session) => {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        return total + (end - start);
      }, 0);

      monthData.push({
        month: monthName,
        sessions: monthSessions.length,
        timeHours: Math.round(totalTime / (1000 * 60 * 60) * 10) / 10,
        completed: monthSessions.filter(s => s.completed).length,
        completionRate: monthSessions.length > 0 ?
          Math.round((monthSessions.filter(s => s.completed).length / monthSessions.length) * 100) : 0
      });
    }

    return monthData.slice(-6); // Last 6 months
  };

  // Helper function for dark mode tooltip styles
  const getTooltipStyle = () => ({
    backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#fff',
    border: `1px solid ${document.documentElement.classList.contains('dark') ? '#4B5563' : '#e5e7eb'}`,
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#374151'
  });

  const generateAIInsights = async () => {
    if (sessions.length === 0) return;

    setLoadingInsights(true);
    try {
      const stats = calculateStats();
      const studyData = {
        totalSessions: stats.totalSessions,
        completedSessions: stats.completedSessions,
        completionRate: stats.completionRate,
        totalStudyTime: stats.totalStudyTime,
        avgSessionLength: stats.avgSessionLength,
        subjectStats: stats.subjectStats,
        streak: getStudyStreak(),
        weeklyData: getWeeklyProgress(),
        monthlyData: getMonthlyProgress(),
        recentSessions: sessions.slice(-10) // Last 10 sessions
      };

      const insights = await aiService.analyzeStudyPatterns(studyData);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const stats = calculateStats();
  const streak = getStudyStreak();
  const weeklyData = getWeeklyProgress();
  const subjectData = getSubjectChartData();
  const monthlyData = getMonthlyProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Study Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">Track your learning progress and patterns</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`btn btn-sm ${timeRange === 'week' ? 'btn-primary' : 'btn-secondary'}`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`btn btn-sm ${timeRange === 'month' ? 'btn-primary' : 'btn-secondary'}`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`btn btn-sm ${timeRange === 'year' ? 'btn-primary' : 'btn-secondary'}`}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Sessions</p>
              <p className="text-3xl font-bold">{stats.totalSessions}</p>
            </div>
            <div className="text-4xl opacity-80">📚</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Completion Rate</p>
              <p className="text-3xl font-bold">{stats.completionRate}%</p>
            </div>
            <div className="text-4xl opacity-80">✅</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Study Streak</p>
              <p className="text-3xl font-bold">{streak}</p>
              <p className="text-purple-100 text-sm">days</p>
            </div>
            <div className="text-4xl opacity-80">🔥</div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Total Study Time</p>
              <p className="text-3xl font-bold">{formatDuration(stats.totalStudyTime)}</p>
            </div>
            <div className="text-4xl opacity-80">⏱️</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Time Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📊 Weekly Study Time</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hours studied per day this week</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={document.documentElement.classList.contains('dark') ? '#374151' : '#f0f0f0'}
                />
                <XAxis
                  dataKey="day"
                  stroke={document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis
                  stroke={document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6b7280'}
                  fontSize={12}
                  label={{
                    value: 'Hours',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6b7280' }
                  }}
                />
                <Tooltip
                  contentStyle={getTooltipStyle()}
                  formatter={(value, name) => [
                    `${value}h`,
                    name === 'timeHours' ? 'Study Time' : name
                  ]}
                />
                <Bar
                  dataKey="timeHours"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  name="Study Time"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Distribution Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📚 Subject Distribution</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Time spent on each subject</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}h`}
                  labelLine={false}
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={getTooltipStyle()}
                  formatter={(value, name, props) => [
                    `${value} hours (${props.payload.sessions} sessions)`,
                    'Study Time'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Progress Line Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📈 6-Month Study Trend</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Study hours and completion rate over the last 6 months</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={document.documentElement.classList.contains('dark') ? '#374151' : '#f0f0f0'}
              />
              <XAxis
                dataKey="month"
                stroke={document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6b7280'}
                fontSize={12}
              />
              <YAxis
                yAxisId="left"
                stroke={document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6b7280'}
                fontSize={12}
                label={{
                  value: 'Hours',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6b7280' }
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6b7280'}
                fontSize={12}
                label={{
                  value: 'Completion %',
                  angle: 90,
                  position: 'insideRight',
                  style: { textAnchor: 'middle', fill: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6b7280' }
                }}
              />
              <Tooltip
                contentStyle={getTooltipStyle()}
                formatter={(value, name) => [
                  name === 'timeHours' ? `${value}h` : `${value}%`,
                  name === 'timeHours' ? 'Study Time' : 'Completion Rate'
                ]}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="timeHours"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                name="Study Time"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="completionRate"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                name="Completion Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Study Sessions Area Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📅 Daily Study Sessions</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Number of study sessions per day this week</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={document.documentElement.classList.contains('dark') ? '#374151' : '#f0f0f0'}
              />
              <XAxis
                dataKey="day"
                stroke={document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6b7280'}
                fontSize={12}
              />
              <YAxis
                stroke={document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6b7280'}
                fontSize={12}
                label={{
                  value: 'Sessions',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6b7280' }
                }}
              />
              <Tooltip
                contentStyle={getTooltipStyle()}
                formatter={(value, name) => [
                  `${value} sessions`,
                  name === 'sessions' ? 'Total Sessions' : 'Completed Sessions'
                ]}
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stackId="1"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.6}
                name="Total Sessions"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="2"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.8}
                name="Completed Sessions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">🎯 Weekly Performance Metrics</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Study time vs completion rate comparison</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={document.documentElement.classList.contains('dark') ? '#374151' : '#f0f0f0'}
              />
              <XAxis
                dataKey="day"
                stroke={document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6b7280'}
                fontSize={12}
              />
              <YAxis
                stroke={document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6b7280'}
                fontSize={12}
              />
              <Tooltip
                contentStyle={getTooltipStyle()}
                formatter={(value, name) => [
                  name === 'timeHours' ? `${value}h` : `${value} sessions`,
                  name === 'timeHours' ? 'Study Time' : 'Completed Sessions'
                ]}
              />
              <Area
                type="monotone"
                dataKey="timeHours"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorTime)"
                strokeWidth={2}
                name="Study Time"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorCompleted)"
                strokeWidth={2}
                name="Completed Sessions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📊 Subject Performance</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Detailed breakdown by subject</p>
          </div>

          <div className="space-y-4">
            {Object.entries(stats.subjectStats).length > 0 ? (
              Object.entries(stats.subjectStats)
                .sort(([,a], [,b]) => b.totalTime - a.totalTime)
                .map(([subject, data], index) => {
                  const completionRate = data.count > 0 ? Math.round((data.completed / data.count) * 100) : 0;
                  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
                  const color = colors[index % colors.length];

                  return (
                    <div key={subject} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: color }}
                          ></div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{subject}</h4>
                        </div>
                        <div className={`badge ${
                          completionRate === 100 ? 'badge-success' :
                          completionRate >= 75 ? 'badge-primary' :
                          completionRate >= 50 ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {completionRate}% complete
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-gray-600 dark:text-gray-400">Sessions</p>
                          <p className="font-bold text-lg" style={{ color }}>{data.count}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 dark:text-gray-400">Study Time</p>
                          <p className="font-bold text-lg" style={{ color }}>
                            {Math.round(data.totalTime / (1000 * 60 * 60) * 10) / 10}h
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 dark:text-gray-400">Completed</p>
                          <p className="font-bold text-lg" style={{ color }}>{data.completed}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${completionRate}%`,
                              backgroundColor: color
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-500 dark:text-gray-400">No study sessions yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Start studying to see your subject breakdown</p>
              </div>
            )}
          </div>
        </div>

        {/* Study Insights */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">🎯 Study Insights</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Key metrics and achievements</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">⏱️ Average Session Length</h4>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{formatDuration(stats.avgSessionLength)}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {stats.avgSessionLength > 3600000 ? 'Great focus! 🎯' :
                     stats.avgSessionLength > 1800000 ? 'Good sessions 👍' : 'Try longer sessions 📈'}
                  </p>
                </div>
                <div className="text-4xl opacity-70">⏱️</div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-200 mb-1">📚 Most Studied Subject</h4>
                  <p className="text-xl font-bold text-green-800 dark:text-green-300">
                    {Object.entries(stats.subjectStats).length > 0
                      ? Object.entries(stats.subjectStats)
                          .sort(([,a], [,b]) => b.totalTime - a.totalTime)[0][0]
                      : 'No data yet'
                    }
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {Object.entries(stats.subjectStats).length > 1 ? 'Keep diversifying! 🌟' :
                     Object.entries(stats.subjectStats).length === 1 ? 'Add more subjects 📖' : 'Start studying! 🚀'}
                  </p>
                </div>
                <div className="text-4xl opacity-70">📚</div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-1">🔥 Study Streak</h4>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">{streak} days</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    {streak > 7 ? 'Excellent! 🌟' :
                     streak > 3 ? 'Good progress! 👍' :
                     streak > 0 ? 'Keep it up! 💪' : 'Start your streak! 🚀'}
                  </p>
                </div>
                <div className="text-4xl opacity-70">🔥</div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg border border-orange-200 dark:border-orange-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-orange-900 dark:text-orange-200 mb-1">📊 Completion Rate</h4>
                  <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">{stats.completionRate}%</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    {stats.completionRate >= 90 ? 'Outstanding! 🏆' :
                     stats.completionRate >= 75 ? 'Great work! ⭐' :
                     stats.completionRate >= 50 ? 'Keep improving! 📈' : 'Focus on completion! 🎯'}
                  </p>
                </div>
                <div className="text-4xl opacity-70">📊</div>
              </div>
            </div>

            {/* Weekly Goal Progress */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-lg border border-indigo-200 dark:border-indigo-700">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3">🎯 Weekly Goal Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-700 dark:text-indigo-300">Study Time Goal</span>
                  <span className="text-indigo-800 dark:text-indigo-200 font-medium">
                    {Math.round(weeklyData.reduce((sum, day) => sum + day.timeHours, 0) * 10) / 10}h / 10h
                  </span>
                </div>
                <div className="w-full bg-indigo-200 dark:bg-indigo-700 rounded-full h-3">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-400 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (weeklyData.reduce((sum, day) => sum + day.timeHours, 0) / 10) * 100)}%`
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-700 dark:text-indigo-300">Sessions Goal</span>
                  <span className="text-indigo-800 dark:text-indigo-200 font-medium">
                    {weeklyData.reduce((sum, day) => sum + day.sessions, 0)} / 14 sessions
                  </span>
                </div>
                <div className="w-full bg-indigo-200 dark:bg-indigo-700 rounded-full h-3">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-400 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (weeklyData.reduce((sum, day) => sum + day.sessions, 0) / 14) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">🤖 AI Study Insights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized recommendations based on your study patterns</p>
            </div>
            <button
              onClick={generateAIInsights}
              disabled={loadingInsights || sessions.length === 0}
              className="btn btn-primary"
            >
              {loadingInsights ? (
                <div className="flex items-center">
                  <div className="spinner-small mr-2"></div>
                  Analyzing...
                </div>
              ) : (
                <>
                  <span className="mr-2">🧠</span>
                  Generate AI Insights
                </>
              )}
            </button>
          </div>
        </div>

        {aiInsights ? (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-start">
              <div className="text-3xl mr-4">🤖</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">AI Analysis Results</h4>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {aiInsights.message}
                </div>
                {aiInsights.source && (
                  <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      {aiInsights.source === 'openai' ? '🤖 Analysis powered by OpenAI' :
                       aiInsights.source === 'intelligent_ai' ? '🧠 Analysis by Intelligent AI' :
                       aiInsights.source === 'mock' ? '🔧 Demo mode analysis' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">No study data available</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Complete some study sessions to get AI-powered insights</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🧠</div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">Ready for AI analysis</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Click the button above to get personalized study insights</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
