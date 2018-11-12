'use strict';

module.exports = function(OrderCharge) {
  const app = require('../../server/server');

  OrderCharge.chargesReport = function(storeId, dateFrom, dateTo, callback) {
    var query = "SELECT c.code, c.name, COUNT(*) AS quantity, SUM(oc.total) AS total FROM `OrderCharge` oc LEFT JOIN `Order` o ON oc.orderId = o.id LEFT JOIN `Charge` c ON oc.chargeId = c.id WHERE o.storeId = ? AND o.date >= ? AND o.date <= ? GROUP BY c.code, c.name ORDER BY quantity DESC";
    var params = [storeId, dateFrom, dateTo];
    var data = [];

    app.dataSources.database.connector.execute(query, params, function(error, rows) {
      if (error) {
        console.log(error);
      } else {
        data = rows;
      }

      callback(null, data);
    });
  };

  OrderCharge.prototype.calculateTotals = function (callback, autosave = false) {
    let self = this;
    let amount = 0;

    app.models.Charge.findOne({ where: { id: this.chargetId } }).then(function (charge) {
      amount = charge.amount;

      self.amount = amount;

      if (autosave) {
        self.save();
      }

      callback();
    });
  }

  OrderCharge.observe('before save', function (ctx, next) {
    ctx.instance.calculateTotals(next);
  });

  OrderCharge.observe('after save', function (ctx, next) {
    app.models.Order.findOne({ where: { id: ctx.instance.orderId } }).then(function (order) {
      order.calculateTotals(next, true);
    });
  });
};
