'use strict';

module.exports = function(OrderCharge) {
  const app = require('../../server/server');

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
