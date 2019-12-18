module.exports = {
  // Notified on bot start. Can be users or channels (make sure to use @|#)
  NOTIFY_GROUPS: ['@sam', '@eganj'],

  //Schedule configurations
  SCHEDULE: true,
  NOTIFY_ASSIGNED: true,
  ANNOUNCE_TIME_HR: 18,
  ANNOUNCE_TIME_MIN: 15,
  ANNOUNCE_DAY_OF_WEEK: 2, //0= Sunday, 1= Monday, ..., 6=Saturday, 7=Sunday
  ANNOUNCE_CHANNEL: '#announcments'
}
