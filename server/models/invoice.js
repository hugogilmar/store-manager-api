'use strict';

module.exports = function(Invoice) {
  const app = require('../../server/server');

  Invoice.paymentMethodsReport = function(storeId, dateFrom, dateTo, callback) {
    var query = "SELECT p.code, p.name, COUNT(*) AS quantity, SUM(i.amount) AS total FROM `Invoice` i LEFT JOIN `Order` o ON i.orderId = o.id LEFT JOIN `PaymentMethod` p ON i.paymentMethodId = p.id WHERE o.storeId = ? AND o.date >= ? AND o.date <= ? GROUP BY p.code, p.name ORDER BY quantity DESC";
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

  Invoice.observe('after save', function (ctx, next) {
    app.models.Order.findOne({ where: { id: ctx.instance.orderId } }).then(function (order) {
      order.calculateTotals(next, true);
    });
  });
};
