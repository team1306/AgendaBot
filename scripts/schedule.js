// Description:
//   Redeploys AkitaBox production apps
//
// Commands:
//   hubot my slack id - responds with your Slack ID

// ================================================================================================
// Module dependencies
// ================================================================================================
const _        = require('underscore');
const schedule = require('node-schedule');
const agenda   = require('./hubot-agenda');

// 0, 0, 0, HR, MIN, SEC, MS

// Time to announce the agenda
const ANNOUNCE_TIME_HR  = 6;
const ANNOUNCE_TIME_MIN = 15;

// Amount of days to wait before next announcement. 7 = weekly, 1 = daily etc.
const ANNOUNCE_SCHEDULE_DAYS = 7;
const ANNOUNCE_DAY_OF_WEEK   = 2;

// ================================================================================================
// Module exports
// ================================================================================================
module.exports = {
  addSchedule : addSchedule
};

function addSchedule(msg) {
  let today = new Date();
  let nextDayOfWeek = getNextDayOfWeek(today, ANNOUNCE_DAY_OF_WEEK);
  let nextDate = new Date(nextDayOfWeek.getFullYear(), nextDayOfWeek.getMonth(), nextDayOfWeek.getDate(), ANNOUNCE_TIME_HR, ANNOUNCE_TIME_MIN);
  //let nextDate = today.getTime() + 604800000;
  nextDate.setDate(nextDate.getDate() + ANNOUNCE_SCHEDULE_DAYS);
  console.log(`Schedule set for: ${nextDate}`);
  msg.send(`Schedule set for: ${nextDate}`);
  let j = schedule.scheduleJob(nextDate, function () {
    console.log('Sending out scheduled agenda');
    agenda.listAgenda();
    addSchedule();
  });
}

function getNextDayOfWeek(date, dayOfWeek) {
  let resultDate = new Date(date.getTime());
  resultDate.setDate(date.getDate() + (dayOfWeek - date.getDay()) % 7);
  return resultDate;
}
