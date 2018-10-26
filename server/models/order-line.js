'use strict';

module.exports = function(OrderLine) {
  const app = require('../../server/server');

  OrderLine.prototype.calculateTotals = function (callback, autosave = false) {
    let self = this;
    let subtotal = 0;
    let subtotalWithOutTaxes = 0;
    let total = 0;
    let taxesTotal = 0;
    let discountsTotal = 0;
    let chargesTotal = 0;
    let price = 0;

    app.models.Product.findOne({ where: { id: this.productId } }).then(function (product) {
      price = product.price;

      subtotal = price * self.quantity;
      subtotalWithOutTaxes = subtotal / 1.13;
      taxesTotal = subtotal - subtotalWithOutTaxes;
      total = subtotal + chargesTotal - discountsTotal;

      self.price = price;
      self.subtotal = subtotal;
      self.taxesTotal = taxesTotal;
      self.discountsTotal = discountsTotal;
      self.chargesTotal = chargesTotal;
      self.total = total;

      if (autosave) {
        self.save();
      }

      callback();
    });
  }

  OrderLine.observe('before save', function (ctx, next) {
    ctx.instance.calculateTotals(next);
  });

  OrderLine.observe('after save', function (ctx, next) {
    app.models.Order.findOne({ where: { id: ctx.instance.orderId } }).then(function (order) {
      order.calculateTotals(next, true);
    });
  });
};
