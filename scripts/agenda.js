// ================================================================================================
// Module dependencies
// ================================================================================================
const _ = require('underscore');
const REDIS_BRAIN_KEY = "agenda";
// ================================================================================================
// Module exports
// ================================================================================================
module.exports = {
  add               : add,
  rmByName          : rmByName,
  rmById            : rmById,
  formatAgenda      : formatAgenda,
  getAgenda         : getAgenda,
  getAgendaSlack    : getAgendaSlack,
  listAgendaChannel : listAgendaChannel
};

function add(robot, value) {
  addBrainData(robot, value);
}
function rmByName(robot, value) {
 if (!getBrainData(robot).includes(value)) {
   return new Error(`'${value}' is not on the agenda.`);
 }
 removeBrainDataByName(robot, value);
 return `Removed '${value}' successfully`;
}
function rmById(robot, value) {
  if (value > getAgendaLength(robot)) {
    console.log(new Error(`Value '${value} is out of bounds of ${getAgendaLength(robot)}`));
    return new Error(`There are only ${getAgendaLength(robot)}. But you tried to remove item #${value}.`);
  }
  removeBrainDataById(robot, value);
  return `Removed '${value}' successfully`;
}

function formatAgenda(agenda) {
  if (!agenda || _.isNull(agenda)) return new Error('Empty agenda');
  return { attachments : [{ text : agenda.sort().join('\n') }] };
}

function getAgenda(robot) {
  if (!getBrainData(robot) || _.isNull(getBrainData(robot))) return new Error('Empty agenda');
  return getBrainData(robot);
}
function getAgendaLength(robot) {
  return getAgenda(robot).length;
}

function getBrainData(robot) {
  return robot.brain.get(REDIS_BRAIN_KEY);
}
function setBrainData(robot, value) {
  return robot.brain.set(REDIS_BRAIN_KEY, value);
}
function clearBrainData(robot) {
  return robot.brain.set(REDIS_BRAIN_KEY, []);
}
function addBrainData(robot, newData) {
  let data = getBrainData(robot);
  if (!data || !_.isArray(data)) return new Error('Data from Redis brain is not valid!');
  data.push(newData);
  console.dir('Data: ' + data);
  return setBrainData(robot, data);
}
function removeBrainDataByName(robot, name) {
  let data = getBrainData(robot);
  if (!data || !_.isArray(data)) return new Error('Data from Redis brain is not valid!');
  if (data.indexOf(name) > -1) {
    data.splice(data.indexOf(name), 1);
  } else {
    return new Error(`${name} is not currently on the agenda.`)
  }
  console.dir('Data: ' + data);
  return setBrainData(robot, data);
}
function removeBrainDataById(robot, id) {
  let data = getBrainData(robot);
  if (!data || !_.isArray(data)) return new Error('Data from Redis brain is not valid!');
  data.splice(id, 1);
  console.dir('Data: ' + data);
  return setBrainData(robot, data);
}

function listAgendaChannel(robot, channel) {
  robot.messageRoom(channel, getAgendaSlack(robot));
}
function getAgendaSlack(robot) {
  let a = getAgenda(robot);
  if (!a || _.isNull(a) || a.length < 1) return 'Empty agenda';
  console.log('Get agenda:' + a);
  let niceAgenda = "";
  for (let i=1; i < a.length+1; i++) {
    niceAgenda += `${i}. ${a[i-1]}`;
    if (i < a.length) {
      niceAgenda+='\n';
    }
  }
  return {
    "attachments": [
      {
        "fallback": "Here is the agenda: " + a,
        "pretext": "Here is the agenda:",
        "text" : niceAgenda
      }
    ]
  };
}
