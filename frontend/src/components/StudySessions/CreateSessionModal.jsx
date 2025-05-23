import React, { useState } from 'react';

const CreateSessionModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    startTime: '',
    endTime: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      setError('End time must be after start time');
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  // Set default times (current time and 1 hour later)
  const setDefaultTimes = () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    
    const formatDateTime = (date) => {
      return date.toISOString().slice(0, 16);
    };

    setFormData({
      ...formData,
      startTime: formatDateTime(now),
      endTime: formatDateTime(oneHourLater)
    });
  };

  React.useEffect(() => {
    if (!formData.startTime) {
      setDefaultTimes();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create Study Session</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="subject" className="form-label">
                Subject *
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                className="form-input"
                placeholder="e.g., Mathematics, Physics, History"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="topic" className="form-label">
                Topic *
              </label>
              <input
                id="topic"
                name="topic"
                type="text"
                required
                className="form-input"
                placeholder="e.g., Calculus, Quantum Mechanics, World War II"
                value={formData.topic}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="form-label">
                  Start Time *
                </label>
                <input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  required
                  className="form-input"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="endTime" className="form-label">
                  End Time *
                </label>
                <input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  required
                  className="form-input"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="form-label">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                className="form-input"
                placeholder="Add any notes about this study session..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn btn-primary"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Session'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSessionModal;
