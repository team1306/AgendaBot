// ================================================================================================
// Module dependencies
// ================================================================================================
const _ = require('underscore');
const REDIS_BRAIN_KEY = "agenda";
// ================================================================================================
// Module exports
// ================================================================================================
module.exports = {
  add          : add,
  rm           : rm,
  formatAgenda : formatAgenda,
  getAgenda    : getAgenda
};

function add(robot, value) {
  addBrainData(robot, value);
}
function rm(robot, value) {
 if (!getBrainData(robot).includes(value)) {
   return new Error(`'${value}' is not on the agenda.`);
 }
 removeBrainData(robot, value);
 return `Removed '${value}' successfully`;
}

function formatAgenda(agenda) {
  if (!agenda || _.isNull(agenda)) return new Error('Empty agenda');
  let attachment = { attachments : [{ text : agenda.sort().join('\n') }] };
  return attachment;
}

function getAgenda(robot) {
  if (!getBrainData(robot) || _.isNull(getBrainData(robot))) return new Error('Empty agenda');
  return getBrainData(robot);
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
function removeBrainData(robot, rmData) {
  let data = getBrainData(robot);
  if (!data || !_.isArray(data)) return new Error('Data from Redis brain is not valid!');
  if (data.indexOf(rmData) > -1) {
    data.splice(data.indexOf(rmData), 1);
  } else {
    return new Error(`${rmData} is not currently on the agenda.`)
  }
  console.dir('Data: ' + data);
  return setBrainData(robot, data);
}
