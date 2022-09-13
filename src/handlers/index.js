module.exports = {
  health: function (data, callback) {
    callback(200, { status: 200, data: "Server OK" });
  },
  notFound: function (data, callback) {
    callback(404, { status: 404, data: "Resource not Found" });
  },
};
