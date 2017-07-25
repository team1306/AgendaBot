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
const moment   = require('moment');
const agenda   = require('./agenda');
const utils    = require('./utils');
const schedule = require('./schedule');

const REDIS_BRAIN_KEY = "agenda";

// ================================================================================================
// Module exports
// ================================================================================================
module.exports = function (robot) {
  let version = require('../package.json').version;
  let startTime = new Date();
  robot.respond(/add (.+)/i, function (msg) {
    add(robot, msg);
  });
  robot.respond(/re?m(?:ove)? (.+)/i, function (msg) {
    rm(robot, msg);
  });
  robot.respond(/l[ist].*/i, function (msg) {
    listAgenda(robot, msg);
  });
  robot.respond(/add schedule/i, function (msg) {
    if (utils.checkError(schedule.addSchedule(robot, msg))) {
      msg.send(err);
    }
  });
  robot.respond(/set schedule (.+)/i, function (msg) {
    if (utils.checkError(schedule.setSchedule(robot, msg, msg.match[1]))) {
      msg.send(err);
    }
  });
  robot.respond(/-?v(?:ersion)?(?!.)/i, function (msg) {
    utils.logMsgData(msg, `v${version}`);
    msg.send(`AgendaBot v${version}`);
  });
  robot.respond(/up?(?:time)?(?!.)/i, function (msg) {
    utils.logMsgData(msg, `UPTIME: ${moment(startTime).fromNow()}`);
    msg.send(`I was started ${moment(startTime).fromNow()}`);
  });
  robot.brain.on('connected', initBrain);
  robot.messageRoom('@sam', `Bot v${version} started @ ${startTime}`);
  console.log(`Bot v${version} started @ ${startTime}`);
  /**
   * Start the robot brain if it has not already been started
   *
   * @param  {Object} robot  Hubot object
   */
  function initBrain() {
    console.log(`LOADED DATA: ${robot.brain.get(REDIS_BRAIN_KEY)}`);
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
  utils.logMsgData(msg, `ADD: '${value}'`);
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
  utils.logMsgData(msg, `RM: '${value}'`);
  // Check if our value is a number
  if (!isNaN(value)) {
    // Need to remove one from our number to account for zero indexing
    value--;
    utils.logMsgData(msg, `RM (ID): '${value}'`);
    if (value < 0) return msg.send(new Error(`Invalid input '${value}'`));
    return msg.send(agenda.rmById(robot, value));
  }
  utils.logMsgData(msg, `RM (NAME): '${value}'`);
  return msg.send(agenda.rmByName(robot, value));
}

/**
 * Send a message with the agenda
 *
 * @param {Object}  robot  Hubot object
 * @param {Object}  msg    Incoming message
 */
function listAgenda(robot, msg) {
  utils.logMsgData(msg, 'LI');
  msg.send(agenda.getAgendaSlack(robot));
}
