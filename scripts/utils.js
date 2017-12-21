// ================================================================================================
// Module dependencies
// ================================================================================================

// ================================================================================================
// Module exports
// ================================================================================================
module.exports = {
  checkError          : checkError,
  checkUserSlackAdmin : checkUserSlackAdmin,
  logMsgData          : logMsgData
};

/**
 * Check if value is an error
 * @param  {Unknown} value Value to check
 * @return {boolean}       If value is an error
 */
function checkError(value) {
  return value instanceof Error;
}

/**
 * Check if the user who sent the message is an admin
 * @param  {Object}  msg Incoming message
 * @return {boolean}     If the sender is an admin
 */
function checkUserSlackAdmin(msg) {
  return true;
  let user = msg.message.user;
  return user.is_admin;
}

/**
 * Log message info and extraData
 * @param {Object}  msg         Incoming message
 * @param {String}  extraData   Any extra data to log
 */
function logMsgData(msg, extraData) {
  let now = new Date();
  console.log(`[${now}] ${msg.message.user.name}: '${msg.message}' && ${extraData}`);
}
