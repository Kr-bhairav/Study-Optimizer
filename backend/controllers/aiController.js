const StudySession = require('../models/StudySession');

// AI-powered study recommendations
exports.getStudyRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's study sessions
    const sessions = await StudySession.find({ user: userId }).sort({ startTime: -1 });
    
    if (sessions.length === 0) {
      return res.json({
        recommendations: [
          {
            type: 'getting_started',
            title: 'Start Your Study Journey',
            description: 'Create your first study session to begin tracking your progress.',
            priority: 'high',
            action: 'create_session'
          }
        ]
      });
    }

    const recommendations = [];
    
    // Analyze completion rate
    const completedSessions = sessions.filter(s => s.completed);
    const completionRate = (completedSessions.length / sessions.length) * 100;
    
    if (completionRate < 70) {
      recommendations.push({
        type: 'completion_rate',
        title: 'Improve Session Completion',
        description: `Your completion rate is ${completionRate.toFixed(1)}%. Try shorter sessions or better time management.`,
        priority: 'high',
        action: 'focus_improvement'
      });
    }

    // Analyze study frequency
    const recentSessions = sessions.filter(s => {
      const sessionDate = new Date(s.startTime);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate > weekAgo;
    });

    if (recentSessions.length < 3) {
      recommendations.push({
        type: 'frequency',
        title: 'Increase Study Frequency',
        description: 'You\'ve only studied a few times this week. Try to maintain a consistent schedule.',
        priority: 'medium',
        action: 'schedule_sessions'
      });
    }

    // Analyze subject diversity
    const subjects = new Set(sessions.map(s => s.subject));
    if (subjects.size === 1 && sessions.length > 5) {
      recommendations.push({
        type: 'diversity',
        title: 'Diversify Your Studies',
        description: 'Consider adding more subjects to your study routine for balanced learning.',
        priority: 'low',
        action: 'add_subjects'
      });
    }

    // Analyze session length
    const avgSessionLength = sessions.reduce((total, session) => {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      return total + (end - start);
    }, 0) / sessions.length;

    if (avgSessionLength < 30 * 60 * 1000) { // Less than 30 minutes
      recommendations.push({
        type: 'session_length',
        title: 'Extend Study Sessions',
        description: 'Your sessions are quite short. Try 45-60 minute sessions for better focus.',
        priority: 'medium',
        action: 'longer_sessions'
      });
    }

    // Check for overdue revisions
    const overdueRevisions = sessions.filter(s => {
      return s.nextRevision && new Date(s.nextRevision) < new Date() && s.completed;
    });

    if (overdueRevisions.length > 0) {
      recommendations.push({
        type: 'revision',
        title: 'Review Overdue Topics',
        description: `You have ${overdueRevisions.length} topics that need revision. Review them to strengthen retention.`,
        priority: 'high',
        action: 'review_topics',
        data: overdueRevisions.slice(0, 3) // Top 3 overdue
      });
    }

    // Positive reinforcement
    if (completionRate > 85 && recentSessions.length >= 5) {
      recommendations.push({
        type: 'achievement',
        title: 'Excellent Progress!',
        description: 'You\'re maintaining great study habits. Keep up the momentum!',
        priority: 'low',
        action: 'continue'
      });
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// AI-powered optimal study schedule
exports.getOptimalSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { availableHours, subjects, goals } = req.body;
    
    // Get user's historical data
    const sessions = await StudySession.find({ user: userId }).sort({ startTime: -1 });
    
    // Analyze best performing times
    const timeAnalysis = {};
    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      if (!timeAnalysis[hour]) {
        timeAnalysis[hour] = { total: 0, completed: 0 };
      }
      timeAnalysis[hour].total++;
      if (session.completed) {
        timeAnalysis[hour].completed++;
      }
    });

    // Find optimal hours (highest completion rate)
    const optimalHours = Object.entries(timeAnalysis)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        completionRate: data.completed / data.total,
        sessions: data.total
      }))
      .filter(h => h.sessions >= 2) // At least 2 sessions for reliability
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3);

    // Generate schedule recommendations
    const schedule = {
      weeklyPlan: [],
      recommendations: {
        optimalTimes: optimalHours.length > 0 ? optimalHours : [
          { hour: 9, completionRate: 0.8, sessions: 0 },
          { hour: 14, completionRate: 0.75, sessions: 0 },
          { hour: 19, completionRate: 0.7, sessions: 0 }
        ],
        sessionLength: 60, // minutes
        breakFrequency: 25, // Pomodoro technique
        weeklyGoal: availableHours || 10
      }
    };

    // Distribute subjects across the week
    const subjectList = subjects || ['General Study'];
    const hoursPerSubject = Math.floor((availableHours || 10) / subjectList.length);
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach((day, index) => {
      const dayPlan = {
        day,
        sessions: []
      };

      if (index < 5) { // Weekdays
        const subject = subjectList[index % subjectList.length];
        const optimalHour = schedule.recommendations.optimalTimes[0]?.hour || 9;
        
        dayPlan.sessions.push({
          subject,
          startTime: `${optimalHour}:00`,
          duration: 60,
          type: 'focused_study',
          priority: 'high'
        });

        if (hoursPerSubject > 1) {
          dayPlan.sessions.push({
            subject,
            startTime: `${optimalHour + 2}:00`,
            duration: 45,
            type: 'review',
            priority: 'medium'
          });
        }
      } else { // Weekends
        dayPlan.sessions.push({
          subject: 'Review & Practice',
          startTime: '10:00',
          duration: 90,
          type: 'comprehensive_review',
          priority: 'medium'
        });
      }

      schedule.weeklyPlan.push(dayPlan);
    });

    res.json(schedule);
  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// AI-powered study analytics
exports.getStudyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const sessions = await StudySession.find({ user: userId }).sort({ startTime: -1 });
    
    if (sessions.length === 0) {
      return res.json({
        insights: [],
        patterns: {},
        predictions: {}
      });
    }

    const analytics = {
      insights: [],
      patterns: {},
      predictions: {}
    };

    // Calculate patterns
    const subjectPerformance = {};
    const timePatterns = {};
    const weeklyPatterns = {};

    sessions.forEach(session => {
      // Subject performance
      if (!subjectPerformance[session.subject]) {
        subjectPerformance[session.subject] = {
          total: 0,
          completed: 0,
          totalTime: 0
        };
      }
      subjectPerformance[session.subject].total++;
      if (session.completed) {
        subjectPerformance[session.subject].completed++;
      }
      
      const sessionTime = new Date(session.endTime) - new Date(session.startTime);
      subjectPerformance[session.subject].totalTime += sessionTime;

      // Time patterns
      const hour = new Date(session.startTime).getHours();
      if (!timePatterns[hour]) {
        timePatterns[hour] = { total: 0, completed: 0 };
      }
      timePatterns[hour].total++;
      if (session.completed) {
        timePatterns[hour].completed++;
      }

      // Weekly patterns
      const dayOfWeek = new Date(session.startTime).getDay();
      if (!weeklyPatterns[dayOfWeek]) {
        weeklyPatterns[dayOfWeek] = { total: 0, completed: 0 };
      }
      weeklyPatterns[dayOfWeek].total++;
      if (session.completed) {
        weeklyPatterns[dayOfWeek].completed++;
      }
    });

    analytics.patterns = {
      subjectPerformance,
      timePatterns,
      weeklyPatterns
    };

    // Generate insights
    const bestSubject = Object.entries(subjectPerformance)
      .sort(([,a], [,b]) => (b.completed/b.total) - (a.completed/a.total))[0];
    
    if (bestSubject) {
      analytics.insights.push({
        type: 'performance',
        title: 'Best Performing Subject',
        description: `You perform best in ${bestSubject[0]} with ${((bestSubject[1].completed/bestSubject[1].total)*100).toFixed(1)}% completion rate.`,
        confidence: 0.8
      });
    }

    const bestTime = Object.entries(timePatterns)
      .filter(([,data]) => data.total >= 2)
      .sort(([,a], [,b]) => (b.completed/b.total) - (a.completed/a.total))[0];
    
    if (bestTime) {
      analytics.insights.push({
        type: 'timing',
        title: 'Optimal Study Time',
        description: `You're most productive at ${bestTime[0]}:00 with ${((bestTime[1].completed/bestTime[1].total)*100).toFixed(1)}% completion rate.`,
        confidence: 0.7
      });
    }

    // Predictions
    const recentTrend = sessions.slice(0, 10);
    const recentCompletionRate = recentTrend.filter(s => s.completed).length / recentTrend.length;
    
    analytics.predictions = {
      nextWeekSessions: Math.round(recentTrend.length * 0.7),
      expectedCompletionRate: recentCompletionRate,
      recommendedFocus: bestSubject ? bestSubject[0] : 'General Study'
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
