import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Calendar = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      const [sessionsResponse, remindersResponse] = await Promise.all([
        axios.get('/study-sessions'),
        axios.get('/study-sessions/reminders')
      ]);

      setSessions(sessionsResponse.data);
      setReminders(remindersResponse.data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return { sessions: [], reminders: [] };

    const dateStr = date.toDateString();

    const dateSessions = sessions.filter(session =>
      new Date(session.startTime).toDateString() === dateStr
    );

    const dateReminders = reminders.filter(reminder =>
      new Date(reminder.nextRevision).toDateString() === dateStr
    );

    return { sessions: dateSessions, reminders: dateReminders };
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    if (!date) return false;
    return date.toDateString() === new Date().toDateString();
  };

  const hasEvents = (date) => {
    if (!date) return false;
    const events = getEventsForDate(date);
    return events.sessions.length > 0 || events.reminders.length > 0;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Study Calendar</h2>
          <p className="text-gray-600 dark:text-gray-400">View your study sessions and revision reminders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Calendar */}
        <div className="xl:col-span-2">
          <div className="card">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <button
                onClick={() => navigateMonth(-1)}
                className="btn btn-secondary btn-sm text-xs lg:text-sm"
              >
                <span className="hidden sm:inline">← Previous</span>
                <span className="sm:hidden">←</span>
              </button>

              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>

              <button
                onClick={() => navigateMonth(1)}
                className="btn btn-secondary btn-sm text-xs lg:text-sm"
              >
                <span className="hidden sm:inline">Next →</span>
                <span className="sm:hidden">→</span>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="p-1 lg:p-2 text-center text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 1)}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                const events = getEventsForDate(date);
                const isSelected = selectedDate && date &&
                  selectedDate.toDateString() === date.toDateString();

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 border border-gray-200 dark:border-gray-600 cursor-pointer transition-colors
                      ${date ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
                      ${isToday(date) ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600' : ''}
                      ${isSelected ? 'bg-blue-100 dark:bg-blue-800/40 border-blue-400 dark:border-blue-500' : ''}
                      ${!date ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}
                    `}
                    onClick={() => date && setSelectedDate(date)}
                  >
                    {date && (
                      <>
                        <div className={`text-xs sm:text-sm font-medium mb-1 ${
                          isToday(date) ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {date.getDate()}
                        </div>

                        {/* Event indicators */}
                        <div className="space-y-1">
                          {events.sessions.slice(0, 2).map((session, idx) => (
                            <div key={idx} className="text-xs bg-blue-100 dark:bg-blue-800/60 text-blue-800 dark:text-blue-200 px-1 py-0.5 rounded truncate">
                              <span className="hidden sm:inline">📚 </span>{session.subject}
                            </div>
                          ))}
                          {events.reminders.slice(0, 2).map((reminder, idx) => (
                            <div key={idx} className="text-xs bg-yellow-100 dark:bg-yellow-800/60 text-yellow-800 dark:text-yellow-200 px-1 py-0.5 rounded truncate">
                              <span className="hidden sm:inline">🔔 </span>{reminder.subject}
                            </div>
                          ))}
                          {(events.sessions.length + events.reminders.length) > 4 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{(events.sessions.length + events.reminders.length) - 4} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Select a date'
              }
            </h3>

            {selectedDate ? (
              <div className="space-y-4">
                {(() => {
                  const events = getEventsForDate(selectedDate);

                  if (events.sessions.length === 0 && events.reminders.length === 0) {
                    return (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No events scheduled for this date
                      </p>
                    );
                  }

                  return (
                    <>
                      {/* Study Sessions */}
                      {events.sessions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Study Sessions</h4>
                          <div className="space-y-2">
                            {events.sessions.map((session) => (
                              <div key={session._id} className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-blue-900 dark:text-blue-200">{session.subject}</span>
                                  <span className={`badge ${session.completed ? 'badge-success' : 'badge-warning'}`}>
                                    {session.completed ? 'Completed' : 'Pending'}
                                  </span>
                                </div>
                                <p className="text-sm text-blue-800 dark:text-blue-300">{session.topic}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Reminders */}
                      {events.reminders.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Revision Reminders</h4>
                          <div className="space-y-2">
                            {events.reminders.map((reminder) => (
                              <div key={reminder._id} className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-yellow-900 dark:text-yellow-200">{reminder.subject}</span>
                                  <span className="badge badge-warning">Due</span>
                                </div>
                                <p className="text-sm text-yellow-800 dark:text-yellow-300">{reminder.topic}</p>
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                  {formatTime(reminder.nextRevision)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Click on a date to view events
              </p>
            )}
          </div>

          {/* Legend */}
          <div className="card">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Legend</h4>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-100 dark:bg-blue-800/60 border border-blue-200 dark:border-blue-700 rounded mr-2"></div>
                <span>Study Sessions</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-800/60 border border-yellow-200 dark:border-yellow-700 rounded mr-2"></div>
                <span>Revision Reminders</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600 rounded mr-2"></div>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
