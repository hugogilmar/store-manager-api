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
    let taxesTotal = 0;
    let discountsTotal = 0;
    let chargesTotal = 0;
    let subtotal = 0;
    let total = 0;
    let amount = 0;
    let balance = 0;

    this.orderLines.find().then(function (orderLines) {
      let billableOrderLines = orderLines.filter(function (orderLine) {
        return orderLine.billable;
      });

      taxesTotal = billableOrderLines.reduce(function (sum, orderLine) {
        return sum + orderLine.taxesTotal;
      }, 0);

      discountsTotal = billableOrderLines.reduce(function (sum, orderLine) {
        return sum + orderLine.discountsTotal;
      }, 0);

      subtotal = billableOrderLines.reduce(function (sum, orderLine) {
        return sum + orderLine.total;
      }, 0);

      self.orderCharges.find().then(function (orderCharges) {
        chargesTotal = orderCharges.reduce(function (sum, orderCharge) {
          let total = subtotal * (orderCharge.amount / 100);
          orderCharge.total = total;
          orderCharge.save();

          return sum + (subtotal * (orderCharge.amount / 100));
        }, 0);

        total = subtotal + chargesTotal - discountsTotal;

        self.invoices.find().then(function (invoices) {
          amount = invoices.reduce(function (sum, invoice) {
            return sum + invoice.amount;
          }, 0);

          balance = amount - self.total;

          self.subtotal = subtotal;
          self.taxesTotal = taxesTotal;
          self.discountsTotal = discountsTotal;
          self.chargesTotal = chargesTotal;
          self.total = total;
          self.balance = balance;

          if (autosave) {
            self.save();
          }

          callback();
        });
      });
    });
  }
};
