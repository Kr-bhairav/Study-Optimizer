import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reminders = ({ user }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // upcoming, overdue, all

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await axios.get('/study-sessions/reminders');
      setReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRevision = async (sessionId, difficulty) => {
    try {
      await axios.put('/study-sessions/complete', {
        sessionId,
        difficulty
      });

      // Remove from reminders list
      setReminders(reminders.filter(reminder => reminder._id !== sessionId));
    } catch (error) {
      console.error('Error completing revision:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilRevision = (dateString) => {
    const now = new Date();
    const revisionDate = new Date(dateString);
    const diffMs = revisionDate - now;

    if (diffMs < 0) {
      const overdueDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
      return { text: `${overdueDays} day(s) overdue`, isOverdue: true };
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return { text: `In ${days} day(s)`, isOverdue: false };
    } else if (hours > 0) {
      return { text: `In ${hours} hour(s)`, isOverdue: false };
    } else {
      return { text: 'Due now', isOverdue: false };
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    const timeInfo = getTimeUntilRevision(reminder.nextRevision);

    switch (filter) {
      case 'upcoming':
        return !timeInfo.isOverdue;
      case 'overdue':
        return timeInfo.isOverdue;
      case 'all':
      default:
        return true;
    }
  });

  const overdueCount = reminders.filter(r => getTimeUntilRevision(r.nextRevision).isOverdue).length;
  const upcomingCount = reminders.filter(r => !getTimeUntilRevision(r.nextRevision).isOverdue).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Revision Reminders</h2>
          <p className="text-gray-600 dark:text-gray-400">Stay on top of your spaced repetition schedule</p>
        </div>

        {overdueCount > 0 && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg">
            <span className="font-medium">⚠️ {overdueCount} overdue reminder(s)</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="card">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('upcoming')}
            className={`btn btn-sm ${filter === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`btn btn-sm ${filter === 'overdue' ? 'btn-danger' : 'btn-secondary'}`}
          >
            Overdue ({overdueCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All ({reminders.length})
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {filteredReminders.length > 0 ? (
          filteredReminders.map((reminder) => {
            const timeInfo = getTimeUntilRevision(reminder.nextRevision);

            return (
              <ReminderCard
                key={reminder._id}
                reminder={reminder}
                timeInfo={timeInfo}
                onComplete={handleCompleteRevision}
              />
            );
          })
        ) : (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">
              {filter === 'overdue' ? '⚠️' : filter === 'upcoming' ? '🔔' : '📚'}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {filter === 'overdue'
                ? 'No overdue reminders'
                : filter === 'upcoming'
                ? 'No upcoming reminders'
                : 'No reminders found'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {filter === 'overdue'
                ? 'Great job staying on track with your revisions!'
                : filter === 'upcoming'
                ? 'Complete some study sessions to get revision reminders.'
                : 'Complete study sessions to start building your revision schedule.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ReminderCard = ({ reminder, timeInfo, onComplete }) => {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [difficulty, setDifficulty] = useState(3);

  const handleComplete = async () => {
    try {
      await onComplete(reminder._id, difficulty);
      setShowCompleteModal(false);
    } catch (error) {
      console.error('Error completing revision:', error);
    }
  };

  const difficultyLabels = {
    1: 'Very Easy',
    2: 'Easy',
    3: 'Medium',
    4: 'Hard',
    5: 'Very Hard'
  };

  return (
    <>
      <div className={`card hover:shadow-md transition-shadow duration-200 ${
        timeInfo.isOverdue
          ? 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
          : 'border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{reminder.subject}</h3>
              <div className={`badge ${timeInfo.isOverdue ? 'badge-danger' : 'badge-warning'}`}>
                {timeInfo.text}
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-2">{reminder.topic}</p>

            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              <p>📅 Scheduled for: {new Date(reminder.nextRevision).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              {reminder.revisionDates && (
                <p>🔄 Revision #{reminder.revisionDates.length}</p>
              )}
            </div>

            {reminder.notes && (
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg mb-3 border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-700 dark:text-gray-300">{reminder.notes}</p>
              </div>
            )}
          </div>

          <div className="ml-4">
            <button
              onClick={() => setShowCompleteModal(true)}
              className="btn btn-success btn-sm"
            >
              <span className="mr-1">✅</span>
              Mark as Reviewed
            </button>
          </div>
        </div>
      </div>

      {/* Complete Revision Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Complete Revision</h3>

            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>{reminder.subject}:</strong> {reminder.topic}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                How well do you remember this material now?
              </p>
            </div>

            <div className="mb-6">
              <label className="form-label">Difficulty Level</label>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <label key={level} className="flex items-center">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={difficulty === level}
                      onChange={(e) => setDifficulty(parseInt(e.target.value))}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {level} - {difficultyLabels[level]}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This will schedule your next revision based on how well you remembered the material.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 btn btn-success"
              >
                Complete Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Reminders;
