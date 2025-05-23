const StudySession = require('../models/StudySession');
const nodemailer = require('nodemailer');

// Configure email transporter (you'll need to set these env variables)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send revision reminders to users
exports.sendRevisionReminders = async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find sessions that need revision in the next 24 hours
    const sessionsToRevise = await StudySession.find({
      nextRevision: { $gte: now, $lte: tomorrow },
      completed: false
    }).populate('user', 'email name');
    
    // Send email reminders
    for (const session of sessionsToRevise) {
      if (!session.user.email) continue;
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: session.user.email,
        subject: 'Study Reminder: Time to revise ' + session.subject,
        text: `
          Hello ${session.user.name},
          
          It's time to revise "${session.topic}" from your ${session.subject} studies.
          
          According to optimal learning patterns, this is the perfect time to strengthen your memory of this material.
          
          Your scheduled revision time: ${session.nextRevision.toLocaleString()}
          
          Happy studying!
          Your Study Scheduler AI
        `
      };
      
      await transporter.sendMail(mailOptions);
    }
    
    console.log(`Sent ${sessionsToRevise.length} revision reminders`);
  } catch (error) {
    console.error('Error sending reminders:', error);
  }
};