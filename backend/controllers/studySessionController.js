const StudySession = require('../models/StudySession');

// Create a new study session
exports.createStudySession = async (req, res) => {
  try {
    const { subject, topic, startTime, endTime, notes } = req.body;
    
    // Calculate next revision date (using spaced repetition)
    const nextRevision = new Date(new Date(endTime).getTime() + (24 * 60 * 60 * 1000)); // 1 day after
    
    const studySession = new StudySession({
      user: req.user.id,
      subject,
      topic,
      startTime,
      endTime,
      nextRevision,
      revisionDates: [nextRevision],
      notes
    });

    await studySession.save();
    res.status(201).json(studySession);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all study sessions for a user
exports.getStudySessions = async (req, res) => {
  try {
    const studySessions = await StudySession.find({ user: req.user.id }).sort({ startTime: 1 });
    res.json(studySessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get upcoming revision reminders
exports.getRevisionReminders = async (req, res) => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const reminders = await StudySession.find({
      user: req.user.id,
      nextRevision: { $gte: now, $lte: tomorrow },
      completed: false
    });
    
    res.json(reminders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark a study session as completed and schedule next revision
exports.completeStudySession = async (req, res) => {
  try {
    const { sessionId, difficulty } = req.body;
    
    const session = await StudySession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Study session not found' });
    }
    
    // Calculate next revision date based on difficulty (1-5)
    // Using a simple spaced repetition algorithm
    const daysUntilNextRevision = Math.pow(2, session.revisionDates.length) * (1 / difficulty);
    const nextRevision = new Date();
    nextRevision.setDate(nextRevision.getDate() + Math.round(daysUntilNextRevision));
    
    session.revisionDates.push(nextRevision);
    session.nextRevision = nextRevision;
    session.completed = true;
    
    await session.save();
    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};