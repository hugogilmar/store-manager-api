'use strict';

module.exports = function(Order) {
  const app = require('../../server/server');

  Order.storesReport = function(dateFrom, dateTo, callback) {
    var query = "SELECT s.name, o.billable, COUNT(*) AS quantity, SUM(o.guests) AS guests, SUM(o.total) AS total FROM `Order` o LEFT JOIN `Store` s ON o.storeId = s.id WHERE o.date >= ? AND o.date <= ? GROUP BY s.name, o.billable ORDER BY quantity DESC";
    var params = [dateFrom, dateTo];
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
