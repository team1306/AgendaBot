// ================================================================================================
// Module dependencies
// ================================================================================================

// ================================================================================================
// Module exports
// ================================================================================================
module.exports = {
  checkError          : checkError,
  checkUserSlackAdmin : checkUserSlackAdmin
};

function checkError(value) {
  return value instanceof Error;
}

function checkUserSlackAdmin(msg) {
  let user = msg.message.user;
  return user.is_admin;
}
