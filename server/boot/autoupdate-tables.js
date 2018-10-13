'use strict';

module.exports = function(app) {
  var ds = app.dataSources.mysql;

  var throwError = function (error) {
    if (error) {
      throw error;
      ds.disconnect();
    }
  }

  for (var model in app.models) {
    ds.isActual(model, function (error, actual) {
      throwError(error);

      if (!actual) {
        ds.autoupdate(model, function (error) {
          throwError(error);
        });
      }
    });
  };
};
