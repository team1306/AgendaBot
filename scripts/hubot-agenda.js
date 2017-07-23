// Description:
//   Redeploys AkitaBox production apps
//
// Commands:
//   hubot add <item> - Adds <item> to the agenda
//   hubot rm/rem/remove <item> - Removes <item> from the agenda
//   hubot li/list - List the agenda
//   hubot schedule - Update the schedule

// ================================================================================================
// Module dependencies
// ================================================================================================
const _        = require('underscore');
const agenda   = require('./agenda');
const utils    = require('./utils');
const schedule = require('./schedule');

const REDIS_BRAIN_KEY = "agenda";

// ================================================================================================
// Module exports
// ================================================================================================
module.exports = function (robot) {
  robot.respond(/add (.+)/i, function (msg) {
    console.dir(msg.message.user);
    add(robot, msg);
  });
  robot.respond(/re?m(?:ove)? (.+)/i, function (msg) {
    rm(robot, msg);
  });
  robot.respond(/li?st?/i, function (msg) {
    listAgenda(robot, msg);
  });
  robot.respond(/add schedule/i, function (msg) {
    if (utils.checkError(schedule.addSchedule(robot, msg))) {
      msg.send(err);
    }
  });
  robot.brain.on('connected', initBrain);
  /**
   * Start the robot brain if it has not already been started
   *
   * @param  {Object} robot  Hubot object
   */
  function initBrain() {
    console.log('PREV REDIS DATA: ' + robot.brain.get(REDIS_BRAIN_KEY));
    if (!robot.brain.get(REDIS_BRAIN_KEY)) {
      console.log('NO PREV DATA');
      robot.brain.set(REDIS_BRAIN_KEY, []);
    }
  }
};

/**
 * Add something to the agenda
 *
 * @param {Object}  robot   Hubot object
 * @param {Object}  msg     Incoming message
 */
function add(robot, msg) {
  let value = msg.match[1];
  console.log(`Add: '${value}'`);
  agenda.add(robot, value);
  return msg.send(`Added '${value}' to the agenda`);
}

/**
 * Remove something from the agenda
 *
 * @param {Object}  robot   Hubot object
 * @param {Object}  msg     Incoming message
 */
function rm(robot, msg) {
  let value = msg.match[1];
  if (!isNaN(value)) {
    // Is a number
    console.log('rm by id');
    return msg.send(agenda.rmById(robot, value));
  }
  console.log('rm by name');
  return msg.send(agenda.rmByName(robot, value));
}

/**
 * Send a message with the agenda
 *
 * @param {Object}  robot  Hubot object
 * @param {Object}  msg    Incoming message
 */
function listAgenda(robot, msg) {
  msg.send(agenda.getAgendaSlack(robot));
}
