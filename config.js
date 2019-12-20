module.exports = {
  // Notified on bot start. Can be users or channels (make sure to use @|#)
  NOTIFY_GROUPS: ['@sam', '@eganj'],

  //Schedule configurations
  SCHEDULE: true,
  NOTIFY_ASSIGNED: true,
  NOTIFY_DAYS_AHEAD: [1, 2, 7],     // How many days ahead of the due date should people be notified. Notifications are sent out for each value in the array. 
  ANNOUNCE_TIME_HR: 18,            // Starting at 0, ending at 23. Applies both to the time for posting the agenda and notifying duedates.
  ANNOUNCE_TIME_MIN: 0,           // 0-59. Similarily applies to both posting agenda and notifying due
  ANNOUNCE_DAY_OF_WEEK: 2,       // 0= Sunday, 1= Monday, ..., 6=Saturday, 7=Sunday
  ANNOUNCE_CHANNEL: '#meetingminutes', // The channel to post the schedule on
  //Website
  DISPLAY_INDEX: true,        //Whether to show the index of an item
  DISPLAY_DUE: true,         //Whether to show the due date of an item
  DISPLAY_ASSIGNED: false   //Whether to show the names of people assigned under an item
}
