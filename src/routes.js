const { health, users, tokens, alerts } = require("./handlers");

module.exports = {
  "api/health": health,
  "api/users": users,
  "api/tokens": tokens,
  "api/alerts": alerts,
};
