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

//const ANNOUNCE_TIME = new Date(0, 0, 0, 6, 15, 0, 0);
let today           = new Date();
let announceDate    = new Date(today.getYear(), today.getMonth(), 21, 5, 30, 0);
// ================================================================================================
// Module exports
// ================================================================================================
module.exports = function (robot) {
  setSchedule();
};
function setSchedule() {
  let j = schedule.scheduleJob('35 * * * *', function () {
    console.log('The answer to life, the universe, and everything!');
  });
}

function addSchedule() {
  let today = new Date();
  let nextDate = today + ANNOUNCE_SCHEDULE_DAYS;
  let j = schedule.scheduleJob(nextDate, function () {
    console.log('The answer to life, the universe, and everything!');
    agenda.listAgenda();
  });
}
