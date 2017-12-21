// Description:
//   Allows easy agenda making
//
// Commands:
//   hubot add <item> - Adds <item> to the agenda
//   hubot rm/rem/remove <item> - Removes <item> from the agenda
//   hubot update <id> <new text> - Updates <id> with <new text>
//   hubot assign <id> <assignee> - Assign an item to <assignee>
//   hubot unassign <id> - Unassign an item
//   hubot set importance <id> <level> - Set the importance/color of an item. <level> = 'high', 'medium', 'low', or 'default'.
//   hubot li/ls/list - List the agenda
//   hubot set schedule - Update the schedule
//   hubot up/uptime - Get the bot's uptime
//   hubot v/-v/version - Get the bot's version
//
//   Found a bug or want a new feature? https://github.com/samr28/hubot-agenda/issues

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
const SCHEDULE = true;

// ================================================================================================
// Module exports
// ================================================================================================
module.exports = function (robot) {
  let version = require('../package.json').version;
  let startTime = new Date();

  // Basic commands
  robot.respond(/(?:agenda )?add (.+)/i, function (msg) {
    add(robot, msg);
  });
  robot.respond(/(?:agenda )?re?m(?:ove)? (.+)/i, function (msg) {
    rm(robot, msg);
  });
  robot.respond(/(?:agenda )?l[ist].*/i, function (msg) {
    listAgenda(robot, msg);
  });

  // Advanced commands
  robot.respond(/(?:agenda )?update (\d+) (.+)/i, function (msg) {
    update(robot, msg);
  });
  robot.respond(/(?:agenda )?assign (\d+) (.+)/i, function (msg) {
    assign(robot, msg);
  });
  robot.respond(/(?:agenda )?unassign (\d+)/i, function (msg) {
    unassign(robot, msg);
  });
  robot.respond(/(?:agenda )?set importance (\d+) (\w+)/i, function (msg) {
    importance(robot, msg);
  });
  robot.respond(/(?:agenda )?set priority (\d+) (\w+)/i, function (msg) {
    importance(robot, msg);
  });

  // Debug/info commands
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
   * @param  {Object} robot  Hubot object
   */
  function initBrain() {
    console.log(`LOADED DATA: ${robot.brain.get(REDIS_BRAIN_KEY)}`);
    if (!robot.brain.get(REDIS_BRAIN_KEY)) {
      console.log('NO PREV DATA');
      robot.brain.set(REDIS_BRAIN_KEY, []);
    }
    if (SCHEDULE) {
      if (utils.checkError(schedule.addSchedule(robot))) {
        NOTIFY_GROUPS.forEach(function (user) {
          robot.messageRoom(user, new Error('Unable to set schedule at startup!'));
        });
      }
    }
  }
};

/**
 * Add something to the agenda
 * @param {Object}  robot   Hubot object
 * @param {Object}  msg     Incoming message
 */
function add(robot, msg) {
  let value = msg.match[1];
  utils.logMsgData(msg, `ADD: '${value}'`);
  return msg.send(agenda.add(robot, value));
}

/**
 * Remove something from the agenda
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
    return msg.send(agenda.rmById(robot, id).toString());
  }
  utils.logMsgData(msg, `RM (NAME): '${id}'`);
  return msg.send(agenda.rmByName(robot, id).toString());
}

/**
 * Send a message with the agenda
 * @param {Object}  robot  Hubot object
 * @param {Object}  msg    Incoming message
 */
function listAgenda(robot, msg) {
  utils.logMsgData(msg, 'LI');
  msg.send(agenda.getAgendaSlack(robot));
}

/**
 * Update one of the agenda items
 * @param  {Object} robot Hubot object
 * @param  {Object} msg   Incoming message
 */
function update(robot, msg) {
  let id = msg.match[1];
  let value = msg.match[2];
  utils.logMsgData(msg, `UPDATE '${id}' '${value}'`);
  if (isNaN(id)) {
    return msg.send(`I didn't understand '${id}'. Type 'agenda help' for help`);
  }
  id--;
  if (id < 0) {
    return msg.send(new Error(`Invalid input '${id+1}'`));
  }
  // Use toString to convert error messages
  return msg.send(agenda.update(robot, id, value).toString());
}

/**
 * Set the assignee of an item
 * @param  {Object} robot Hubot object
 * @param  {Object} msg   Incoming message
 */
function assign(robot, msg) {
  let id = msg.match[1];
  let assignee = msg.match[2];
  utils.logMsgData(msg, `ASSIGN #${id} TO '${assignee}'`);
  if (isNaN(id)) {
    return msg.send(`I didn't understand '${id}'. Type 'agenda help' for help`);
  }
  id--;
  if (id < 0) {
    return msg.send(new Error(`Invalid input '${id+1}'`));
  }
  if (!_.isString(assignee)) {
      return msg.send(`I didn't understand '${assignee}'. Type 'agenda help' for help`);
  }
  return msg.send(agenda.assign(robot, id, assignee).toString());
}
/**
 * Resets the assignee of an item
 * @param  {Object} robot Hubot object
 * @param  {Object} msg   Incoming message
 */
function unassign(robot, msg) {
  let id = msg.match[1];
  utils.logMsgData(msg, `UNASSIGN #${id}`);
  if (isNaN(id)) {
    return msg.send(`I didn't understand '${id}'. Type 'agenda help' for help`);
  }
  id--;
  if (id < 0) {
    return msg.send(new Error(`Invalid input '${id+1}'`));
  }
  return msg.send(agenda.unassign(robot, id).toString());
}
/**
 * Set the importance/color of an item
 * @param  {Object} robot Hubot object
 * @param  {Object} msg   Incoming message
 */
function importance(robot, msg) {
  let id = msg.match[1];
  let importance = msg.match[2];
  let validInput = ["high", "default", "medium", "low"];
  utils.logMsgData(msg, `SET IMPORTANCE #${id} ${importance}`);
  if (isNaN(id)) {
    return msg.send(`I didn't understand '${id}'. Type 'agenda help' for help`);
  }
  if (!_.contains(validInput, importance)) {
    return msg.send(`I didn't understand '${importance}'. Use 'high', 'medium', or 'low'`);
  }
  return msg.send(agenda.setImportance(robot, id, importance).toString());
}
