// Description:
//   Allows easy agenda making
//
// Commands:
//   hubot add <item> - Adds <item> to the agenda
//   hubot rm/rem/remove <item> - Removes <item> from the agenda
//   hubot update <id> <new text> - Updates <id> with <new text>
//   hubot li/ls/list - List the agenda
//   hubot set schedule - Update the schedule
//   hubot up/uptime - Get the bot's uptime
//   hubot v/-v/version - get the bot's version

// ================================================================================================
// Module dependencies
// ================================================================================================
const _        = require('underscore');
const moment   = require('moment');
const agenda   = require('./agenda');
const utils    = require('./utils');
const schedule = require('./schedule');

const REDIS_BRAIN_KEY = "agenda";
// Notified on bot start. Can be users or channels (make sure to use @|#)
const NOTIFY_GROUPS = ['@sam'];

// ================================================================================================
// Module exports
// ================================================================================================
module.exports = function (robot) {
  let version = require('../package.json').version;
  let startTime = new Date();
  robot.respond(/(?:agenda )?add (.+)/i, function (msg) {
    add(robot, msg);
  });
  robot.respond(/(?:agenda )?re?m(?:ove)? (.+)/i, function (msg) {
    rm(robot, msg);
  });
  robot.respond(/(?:agenda )?l[ist].*/i, function (msg) {
    listAgenda(robot, msg);
  });
  robot.respond(/(?:agenda)?update (\d+) (.+)/i, function (msg) {
    update(robot, msg);
  });
  robot.respond(/(?:agenda )?set schedule/i, function (msg) {
    if (!utils.checkUserSlackAdmin(msg)) {
      return msg.send(new Error('You do not have permission to perform this action'));
    }
    if (utils.checkError(schedule.addSchedule(robot, msg, msg.match[1]))) {
      msg.send(new Error('An error occurred'));
    }
  });
  robot.respond(/(?:agenda )?cancel schedule/i, function (msg) {
    if (!utils.checkUserSlackAdmin(msg)) {
      return msg.send(new Error('You do not have permission to perform this action'));
    }
    schedule.cancelSchedule();
    return msg.send('Schedule canceled');
  });
  robot.respond(/(?:agenda )?-?v(?:ersion)?(?!.)/i, function (msg) {
    utils.logMsgData(msg, `v${version}`);
    msg.send(`AgendaBot v${version}`);
  });
  robot.respond(/(?:agenda )?up?(?:time)?(?!.)/i, function (msg) {
    utils.logMsgData(msg, `UPTIME: ${moment(startTime).fromNow()}`);
    msg.send(`I was started ${moment(startTime).fromNow()}`);
  });

  robot.brain.on('connected', initBrain);
  NOTIFY_GROUPS.forEach(function (user) {
    robot.messageRoom(user, `Bot v${version} started @ ${startTime}`);
  });
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
  let id = msg.match[1];
  utils.logMsgData(msg, `RM: '${id}'`);
  // Check if our value is a number
  if (!isNaN(id)) {
    // Need to remove one from our number to account for zero indexing
    id--;
    utils.logMsgData(msg, `RM (ID): '${id}'`);
    if (id < 0) return msg.send(new Error(`Invalid input '${id+1}'`));
    return msg.send(agenda.rmById(robot, id));
  }
  utils.logMsgData(msg, `RM (NAME): '${id}'`);
  return msg.send(agenda.rmByName(robot, id));
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

/**
 * Update one of the agenda items
 *
 * @param  {Object} robot Hubot Object
 * @param  {Object} msg   Incoming message
 * @return {[type]}       [description]
 */
function update(robot, msg) {
  let id = msg.match[1];
  let value = msg.match[2];
  utils.logMsgData(msg, `UPDATE '${id}' '${value}'`);
  if (isNaN(id)) {
    msg.send(`I didn't understand '${id}'. Type 'agenda help' for help`);
  }
  id--;
  if (id < 0) return msg.send(new Error(`Invalid input '${id+1}'`));
  return msg.send(agenda.update(robot, id, value));
}
