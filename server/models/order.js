'use strict';

module.exports = function(Order) {
  const app = require('../../server/server');

  Order.paymentMethodsReport = function(storeId, dateFrom, dateTo, callback) {
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
};
