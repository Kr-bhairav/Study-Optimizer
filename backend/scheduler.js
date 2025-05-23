const cron = require('node-cron');
const { sendRevisionReminders } = require('./services/reminderService');

// Schedule reminder checks to run every hour
const initScheduler = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled reminder check...');
    await sendRevisionReminders();
  });
  
  console.log('Scheduler initialized');
};

module.exports = initScheduler;