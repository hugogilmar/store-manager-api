'use strict';

module.exports = function(app) {
  var ds = app.dataSources.database;

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
