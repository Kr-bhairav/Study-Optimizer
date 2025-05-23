import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateSessionModal from './CreateSessionModal';
import SessionCard from './SessionCard';

const StudySessions = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, completed, pending
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleCreateSession = async (sessionData) => {
    try {
      const response = await axios.post('/study-sessions', sessionData);
      setSessions([response.data, ...sessions]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const handleCompleteSession = async (sessionId, difficulty) => {
    try {
      const response = await axios.put('/study-sessions/complete', {
        sessionId,
        difficulty
      });

      setSessions(sessions.map(session =>
        session._id === sessionId ? response.data : session
      ));
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesFilter = filter === 'all' ||
      (filter === 'completed' && session.completed) ||
      (filter === 'pending' && !session.completed);

    const matchesSearch = session.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.topic.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Study Sessions</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage and track your study sessions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <span className="mr-2">➕</span>
          New Session
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search sessions by subject or topic..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All ({sessions.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Pending ({sessions.filter(s => !s.completed).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`btn btn-sm ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Completed ({sessions.filter(s => s.completed).length})
            </button>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <SessionCard
              key={session._id}
              session={session}
              onComplete={handleCompleteSession}
            />
          ))
        ) : (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm || filter !== 'all' ? 'No sessions found' : 'No study sessions yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first study session to get started with your learning journey'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                <span className="mr-2">➕</span>
                Create Your First Session
              </button>
            )}
          </div>
        )}
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

export default StudySessions;
