// ================================================================================================
// Module dependencies
// ================================================================================================
// ================================================================================================
// Module exports
// ================================================================================================
module.exports = {
  add       : add,
  getAgenda : getAgenda
};

function getAgenda(robot, msg) {
  if (!getBrainData(robot) || _.isNull(getBrainData(robot))) return msg.send(new Error('Empty agenda'));
  return getBrainData(robot);
}

function add(robot, value) {
  addBrainData(robot, value);
}

function getBrainData(robot) {
  return robot.brain.get(REDIS_BRAIN_KEY);
}

function setBrainData(robot, value) {
  return robot.brain.set(REDIS_BRAIN_KEY, value);
}
function addBrainData(robot, newData) {
  let data = getBrainData(robot);
  if (!data || !_.isArray(data)) return new Error('Data from Redis brain is not valid!');
  data.push(newData);
  console.dir('Data: ' + data);
  return setBrainData(robot, data);
}
