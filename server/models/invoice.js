'use strict';

module.exports = function(Invoice) {
  const app = require('../../server/server');

  Invoice.observe('after save', function (ctx, next) {
    app.models.Order.findOne({ where: { id: ctx.instance.orderId } }).then(function (order) {
      order.calculateBalance(next, true);
    });
  });
};
