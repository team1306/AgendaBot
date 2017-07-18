// Description:
//   Redeploys AkitaBox production apps
//
// Commands:
//   hubot my slack id - responds with your Slack ID

// ================================================================================================
// Module dependencies
// ================================================================================================
const _      = require('underscore');
const agenda = require('./agenda');

const REDIS_BRAIN_KEY = "agenda";
// ================================================================================================
// Module exports
// ================================================================================================
module.exports = function (robot) {
  robot.respond(/add (.+)/i, function (msg) {
    add(robot, msg);
  });
  robot.respond(/agenda/i, function (msg) {
    listAgenda(robot, msg);
  });
  robot.on('connected', initBrain);
  initBrain(robot);
};

function add(robot, msg) {
  let value = msg.match[1];
  agenda.add(robot, value);
  return msg.send(`Added '${value}' to the agenda`);
}

function setSchedule(robot, msg, date) {
  let j = schedule.scheduleJob(date, function () {
    console.log('Sending agenda message');
    listAgenda(robot, msg);
  });
}

function listAgenda(robot, msg) {
  let agenda = agenda.getAgenda(robot, msg);
  if (!getBrainData(robot) || _.isNull(getBrainData(robot))) return msg.send(new Error('Empty agenda'));
  let attachment = { attachments : [{ text : getBrainData(robot).sort().join('\n') }] };
  msg.send(`Here is the agenda` + attachment);
  console.dir(attachment);
}

/**
 * Start the robot brain if it has not already been started
 *
 * @param  {Object}     robot    Hubot object
 */
function initBrain(robot) {
  // Set timeout since there is a lag between discovering redis and loading data.
  setTimeout(function () {
    console.log('PREV REDIS DATA: ' + robot.brain.get(REDIS_BRAIN_KEY));
    if (!robot.brain.get(REDIS_BRAIN_KEY)) {
      console.log('NO PREV DATA');
      robot.brain.set(REDIS_BRAIN_KEY, []);
    }
  }, 400);
}
