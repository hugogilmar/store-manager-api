'use strict';

module.exports = function(app) {
  var ds = app.dataSources.database;
  ds.setMaxListeners(0);

  var throwError = function (error) {
    if (error) {
      throw error;
      ds.disconnect();
    }
  }

  ds.autoupdate(function (error) {
    throwError(error);
  });
};
