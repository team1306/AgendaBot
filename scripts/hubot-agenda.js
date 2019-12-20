// Description:
//   Allows easy agenda making
//
// Commands:
//   hubot add <item> - Adds <item> to the agenda
//   hubot rm/rem/remove <item> - Removes <item> from the agenda
//   hubot clear - Clear the agenda
//   hubot update <id> <new text> - Updates <id> with <new text>
//   hubot assign <id> <assignee> - Assign an item to <assignee>. Multiple assignees can be inputed separated by commas
//   hubot unassign <id> <assignee> - Unassign an item. An assignee of 'a' or 'all' removes all assignees.
//   hubot set due <id> <mm> <dd> - Set a due date to the item. mm is an integer 1 - 12 representing the month, and dd is a number 1-31 for the day.
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
const _ = require('underscore');
const moment = require('moment');
const l = require('@samr28/log');
const agenda = require('./agenda');
const utils = require('./utils');
const schedule = require('./schedule');
const config = require('../config');

l.on();
l.setColors({
  redis: "blue",
  notification: "red"
});
const REDIS_BRAIN_KEY = "agenda";

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
  robot.respond(/(?:agenda )?clear/i, function (msg) {
    clearAgenda(robot, msg);
  });

  // Advanced commands
  robot.respond(/(?:agenda )?update (\d+) (.+)/i, function (msg) {
    update(robot, msg);
  });
  robot.respond(/(?:agenda )?assign (\d+) (.+)/i, function (msg) {
    assign(robot, msg);
  });
  robot.respond(/(?:agenda )?unassign (\d+) (.+)/i, function (msg) {
    unassign(robot, msg);
  });
  robot.respond(/(?:agenda )?set importance (\d+) (\w+)/i, function (msg) {
    importance(robot, msg);
  });
  robot.respond(/(?:agenda )?set priority (\d+) (\w+)/i, function (msg) {
    importance(robot, msg);
  });
  robot.respond(/(?:agenda )?set due (\d+) (\d\d?)[ \\\/](\d\d?)/, function (msg) {
    due(robot, msg);
  })
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
  config.NOTIFY_GROUPS.forEach(function (user) {
    robot.messageRoom(user, `Bot v${version} started @ ${startTime}`);
  });
  l.log(`Bot v${version} started @ ${startTime}`, "info");
  /**
   * Start the robot brain if it has not already been started
   * @param  {Object} robot  Hubot object
   */
  function initBrain() {
    l.log(`LOADED DATA: ${robot.brain.get(REDIS_BRAIN_KEY)}`, "redis");
    if (!robot.brain.get(REDIS_BRAIN_KEY)) {
      l.log('NO PREV DATA', "redis");
      robot.brain.set(REDIS_BRAIN_KEY, []);
    }
    if (config.SCHEDULE) {
      if (utils.checkError(schedule.addSchedule(robot))) {
        config.NOTIFY_GROUPS.forEach(function (user) {
          robot.messageRoom(user, new Error('Unable to set schedule at startup!'));
        });
      } else if (config.NOTIFY_ASSIGNED) {
        //let assigned individuals know that the task is due
        let rule = new schedule.RecurrenceRule();
        rule.hour = config.ANNOUNCE_TIME_HR;
        rule.minute = config.ANNOUNCE_TIME_MIN;
        schedule.scheduleCallbackRegular((function (robot) {
          console.log(agenda.notifyAssigned);
          agenda.notifyAssigned(robot);
        }).bind(null, robot), rule, "NOTIFY ASSIGNED");
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
    if (id < 0) return msg.send(new Error(`Invalid input '${id + 1}'`));
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
 * Clear the agenda
 *
 * @param   {Object}  robot  Hubot object
 * @param   {Object}  msg    Incoming message
 */
function clearAgenda(robot, msg) {
  utils.logMsgData(msg, `CLEAR`);
  return msg.send(agenda.clear(robot));
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
    return msg.send(new Error(`Invalid input '${id + 1}'`));
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
    return msg.send(new Error(`Invalid input '${id + 1}'`));
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
  let assignee = msg.match[2];
  console.log(assignee);
  utils.logMsgData(msg, `UNASSIGN #${id}`);
  if (isNaN(id)) {
    return msg.send(`I didn't understand '${id}'. Type 'agenda help' for help`);
  }
  id--;
  if (id < 0) {
    return msg.send(new Error(`Invalid input '${id + 1}'`));
  }
  return msg.send(agenda.unassign(robot, id, assignee).toString());
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
/**
 * Set the duedate of an item
 * @param  {Object} robot Hubot object
 * @param  {Object} msg   Incoming message
 */
function due(robot, msg) {
  let id = msg.match[1];
  let month = msg.match[2];
  let day = msg.match[3];
  utils.logMsgData(msg, `SET DUEDATE #${id} TO MNTH ${month} AND DAY ${day}`);
  if (id < 1 || isNaN(id) || id > agenda.getAgenda(robot).length) {
    return msg.send(`I didn't understand id '${id}'. Type 'agenda help' for help`);
  }
  if (month < 1 || month > 12 || isNaN(month)) {
    return msg.send(`I didn't understand month '${month}'. Type 'agenda help' for help`);
  }
  if (day < 1 || day > 31 || isNaN(day)) {
    return `I didn't understand day '${day}'. Type 'agenda help' for help`;
  }
  return msg.send(agenda.setDue(robot, id - 1, month, day));
}