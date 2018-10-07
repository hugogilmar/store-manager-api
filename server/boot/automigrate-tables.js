'use strict';

module.exports = function(app) {
  var ds = app.dataSources.mysql;

  ds.automigrate(function(error) {
    if (error) {
      throw error;
      ds.disconnect();
    }
  });
};
