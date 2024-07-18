const { scheduleJob } = require("../utils/jobScheduler");

// Define the job function
function myJobFunction() {
    console.log('Executing job at:', new Date().toLocaleString());
    // Add your job logic here
  }
  
  // Schedule the job
  scheduleJob({
    initialHour: 9,
    initialMinute: 16,
    intervalMinutes: 5,
    jobFunction: myJobFunction
  });