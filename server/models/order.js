'use strict';

module.exports = function(Order) {
  Order.prototype.calculateTotals = function (callback, autosave = false) {
    let self = this;
    let subtotal = 0;
    let total = 0;
    let taxesTotal = 0;
    let discountsTotal = 0;
    let chargesTotal = 0;

    this.orderLines.find().then(function (orderLines) {
      subtotal = orderLines.reduce(function (sum, orderLine) {
        return sum + orderLine.subtotal;
      }, 0);

      discountsTotal = orderLines.reduce(function (sum, orderLine) {
        return sum + orderLine.discountsTotal;
      }, 0);

      chargesTotal = orderLines.reduce(function (sum, orderLine) {
        return sum + orderLine.chargesTotal;
      }, 0);

      taxesTotal = orderLines.reduce(function (sum, orderLine) {
        return sum + orderLine.taxesTotal;
      }, 0);

      total = subtotal + chargesTotal - discountsTotal;

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

  Order.prototype.calculateBalance = function (callback, autosave = false) {
    let self = this;
    let amount = 0;
    let balance = 0;

    this.invoices.find().then(function (invoices) {
      amount = invoices.reduce(function (sum, invoice) {
        return sum + invoice.amount;
      }, 0);

      balance = amount - self.total;

      self.balance = balance;

      if (autosave) {
        self.save();
      }

      callback();
    });
  }

  Order.observe('before save', function (ctx, next) {
    ctx.instance.calculateTotals(next);
  });

  Order.observe('before save', function (ctx, next) {
    ctx.instance.calculateBalance(next);
  });
};
