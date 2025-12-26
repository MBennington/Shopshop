const cron = require('node-cron');

// Import all job files
const autoConfirmDeliveryJob = require('./auto-confirm-delivery.job');

/**
 * Initialize and start all cron jobs
 */
const startCronJobs = () => {
  console.log('Initializing cron jobs...');

  // Auto-confirm delivery job: Run daily at 2 AM
  // Checks for suborders where seller marked as delivered and threshold days have passed
  cron.schedule('0 2 * * *', () => {
    autoConfirmDeliveryJob.run();
  });

  //For testing purposes - runs every 20 seconds
  // cron.schedule('*/20 * * * * *', () => {
  //   autoConfirmDeliveryJob.run();
  // });

  console.log('Cron jobs initialized successfully');
};

module.exports = {
  startCronJobs,
};
