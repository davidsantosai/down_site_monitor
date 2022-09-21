const { health, users, tokens } = require("./handlers");

module.exports = {
  "api/health": health,
  "api/users": users,
  "api/tokens": tokens,
};
