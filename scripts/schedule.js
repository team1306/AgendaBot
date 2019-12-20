// ================================================================================================
// Module dependencies
// ================================================================================================
const schedule = require('node-schedule');
const agenda = require('./agenda');
const utils = require('./utils');
const l = require('@samr28/log');
const config = require("../config");
l.on();
l.setColors({
  schedule: "green"
});

// 0, 0, 0, HR, MIN, SEC, MS

// Time to announce the agenda- Grab from config.
const ANNOUNCE_TIME_HR = config.ANNOUNCE_TIME_HR % 24;
const ANNOUNCE_TIME_MIN = config.ANNOUNCE_TIME_MIN % 60;

// Which day of week to announce the agenda
const ANNOUNCE_DAY_OF_WEEK = config.ANNOUNCE_DAY_OF_WEEK % 7;

const ANNOUNCE_CHANNEL = config.ANNOUNCE_CHANNEL;

// ================================================================================================
// Module exports
// ================================================================================================
module.exports = {
  addSchedule: addSchedule,
  setSchedule: setSchedule,
  cancelSchedule: cancelSchedule,
  daysUntil: daysUntil,
  scheduleCallbackRegular: scheduleCallbackRegular,
  scheduleCallback : scheduleCallback,
  //forward rules
  RecurrenceRule: schedule.RecurrenceRule
};


function addSchedule(robot) {
  let today = new Date();
  let nextDate = getNextDate(today, ANNOUNCE_DAY_OF_WEEK);
  let nextDateWithTime = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate(),
    ANNOUNCE_TIME_HR, ANNOUNCE_TIME_MIN);
  let j = schedule.scheduleJob(nextDateWithTime, function () {
    l.log('Sending out scheduled agenda', "schedule");
    agenda.listAgendaChannel(robot, ANNOUNCE_CHANNEL);
    addSchedule(robot);
  });
}



function setSchedule(robot, msg, date) {
  if (!utils.checkUserSlackAdmin(msg)) {
    return new Error('User does not have permission');
  }
  l.log(`Schedule set for: ${date}`, "schedule");
  msg.send(`Schedule set for: ${date}`);
  currentSchedule = schedule.scheduleJob(date, function () {
    l.log('Sending out scheduled agenda', "schedule");
    agenda.listAgendaChannel(robot, ANNOUNCE_CHANNEL);
    addSchedule();
  });
}

function cancelSchedule() {
  currentSchedule.cancel();
}

/**
 * Calls a function at a given time.
 * 
 * To store current data to be passed to the callback, use function binding.
 * @param {function} callback 
 * @param {int} month - int, 1-12, representing the month. Required.
 * @param {int} dayOfMonth - int, 1-31 (depending on the month). Required.
 * @param {int} hour - int, 0-23. Optional: Defaults to 10 (9am)
 * @param {int} minute - int, 0-59. Optional: Defaults to 0.
 * @param {Job} - the job created for the callbacks
 */
function scheduleCallback(callback, month, dayOfMonth, hour, minute, name) {
  //dates are created with months 0-12
  month = month - 1;
  hour = hour || 10;
  minute = minute || 0;
  let today = new Date();
  let year = today.getFullYear();
  if (month > today.getMonth()) {
    //Past the month in this year, must be next year.
    year += 1;
  }
  let executionDate = new Date(year, month, dayOfMonth, hour, minute);
  return schedule.scheduleJob(name, executionDate, callback);
}

/**
 * Calls a function at given times.
 * 
 * To attach current data to the function, use binding
 * @param {function} callback 
 * @param {RecurrenceRule} rule 
 * @param {String} name 
 * @returns {Job} - the job created by the schedule
 */
function scheduleCallbackRegular(callback, rule, name) {
  l.log(`Creating regular callback with name ${name}`, "schedule");
  return schedule.scheduleJob(name, rule, callback);
}

/**
 * 
 * @param {int} month 
 * @param {int} dayOfMonth 
 */
function daysUntil(month, dayOfMonth) {
  let today = new Date();
  let then = new Date();
  then.setMonth(month-1);
  then.setDate(dayOfMonth);
  let diff = new Date(then.getTime()-today.getTime());
  return diff.getDate()
}

function getNextDate(today, dayOfWeek) {
  let returnDate = new Date();
  returnDate.setDate(today.getDate() + (dayOfWeek + 7 - today.getDay()) % 7);
  if (today.getDate() === returnDate.getDate()) {
    returnDate.setDate(today.getDate() + 7);
  }
  return returnDate;
}
