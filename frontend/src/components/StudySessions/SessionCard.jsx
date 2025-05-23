import React, { useState } from 'react';

const SessionCard = ({ session, onComplete }) => {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [difficulty, setDifficulty] = useState(3);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getNextRevisionDate = () => {
    if (session.nextRevision) {
      return formatDate(session.nextRevision);
    }
    return 'Not scheduled';
  };

  const handleComplete = async () => {
    try {
      await onComplete(session._id, difficulty);
      setShowCompleteModal(false);
    } catch (error) {
      console.error('Error completing session:', error);
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
      <div className="card hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{session.subject}</h3>
              <div className={`badge ${session.completed ? 'badge-success' : 'badge-warning'}`}>
                {session.completed ? 'Completed' : 'Pending'}
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-2">{session.topic}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <div className="flex items-center">
                <span className="mr-1">📅</span>
                {formatDate(session.startTime)}
              </div>
              <div className="flex items-center">
                <span className="mr-1">⏱️</span>
                {formatDuration(session.startTime, session.endTime)}
              </div>
              {session.completed && (
                <div className="flex items-center">
                  <span className="mr-1">🔄</span>
                  Next revision: {getNextRevisionDate()}
                </div>
              )}
            </div>

            {session.notes && (
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">{session.notes}</p>
              </div>
            )}

            {session.revisionDates && session.revisionDates.length > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Revision history:</span> {session.revisionDates.length} revision(s)
              </div>
            )}
          </div>

          <div className="ml-4">
            {!session.completed ? (
              <button
                onClick={() => setShowCompleteModal(true)}
                className="btn btn-success btn-sm"
              >
                <span className="mr-1">✅</span>
                Complete
              </button>
            ) : (
              <div className="text-green-600 text-2xl">✅</div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Session Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Complete Study Session</h3>

            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>{session.subject}:</strong> {session.topic}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                How difficult was this material to understand?
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
                This helps optimize your revision schedule using spaced repetition.
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
                Complete Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionCard;
