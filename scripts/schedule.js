// ================================================================================================
// Module dependencies
// ================================================================================================
const schedule = require('node-schedule');
const agenda   = require('./agenda');
const utils    = require('./utils');

// 0, 0, 0, HR, MIN, SEC, MS

// Time to announce the agenda
const ANNOUNCE_TIME_HR  = 18;
const ANNOUNCE_TIME_MIN = 15;

// Which day of week to announce the agenda
const ANNOUNCE_DAY_OF_WEEK = 2;

const ANNOUNCE_CHANNEL = '#announcements';

// ================================================================================================
// Module exports
// ================================================================================================
module.exports = {
  addSchedule    : addSchedule,
  setSchedule    : setSchedule,
  cancelSchedule : cancelSchedule
};

let currentScheule;

function addSchedule(robot) {
  let today = new Date();
  let nextDate = getNextDate(today, ANNOUNCE_DAY_OF_WEEK);
  let nextDateWithTime = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate(),
    ANNOUNCE_TIME_HR, ANNOUNCE_TIME_MIN);
  let j = schedule.scheduleJob(nextDateWithTime, function () {
    console.log('Sending out scheduled agenda @ ' + new Date());
    agenda.listAgendaChannel(robot, ANNOUNCE_CHANNEL);
    addSchedule(robot);
  });
}

function setSchedule(robot, msg, date) {
  if (!utils.checkUserSlackAdmin(msg)) {
    return new Error('User does not have permission');
  }
  console.log(`Schedule set for: ${date}`);
  msg.send(`Schedule set for: ${date}`);
  currentSchedule = schedule.scheduleJob(date, function () {
    console.log('Sending out scheduled agenda');
    agenda.listAgendaChannel(robot, ANNOUNCE_CHANNEL);
    addSchedule();
  });
}

function cancelSchedule() {
  currentSchedule.cancel();
}

function getNextDate(today, dayOfWeek) {
  let returnDate = new Date();
  returnDate.setDate(today.getDate() + (dayOfWeek + 7 - today.getDay()) % 7);
  if (today.getDate() === returnDate.getDate()) {
    returnDate.setDate(today.getDate() + 7);
  }
  return returnDate;
}
