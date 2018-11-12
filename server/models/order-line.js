'use strict';

module.exports = function(OrderLine) {
  const app = require('../../server/server');

  OrderLine.productsReport = function(storeId, dateFrom, dateTo, callback) {
    var query = "SELECT p.code, p.name, SUM(ol.quantity) AS quantity, SUM(ol.total) AS total FROM `OrderLine` ol LEFT JOIN `Order` o ON ol.orderId = o.id LEFT JOIN `Product` p ON ol.productId = p.id WHERE o.storeId = ? AND o.date >= ? AND o.date <= ? GROUP BY p.code, p.name ORDER BY quantity DESC";
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

  OrderLine.productCategoriesReport = function(storeId, dateFrom, dateTo, callback) {
    var query = "SELECT pc.code, pc.name, SUM(ol.quantity) AS quantity, SUM(ol.total) AS total FROM `OrderLine` ol LEFT JOIN `Order` o ON ol.orderId = o.id LEFT JOIN `Product` p ON ol.productId = p.id LEFT JOIN `ProductCategory` pc ON p.productCategoryId = pc.id WHERE o.storeId = ? AND o.date >= ? AND o.date <= ? GROUP BY pc.code, pc.name ORDER BY quantity DESC";
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

  OrderLine.prototype.calculateTotals = function (callback, autosave = false) {
    let self = this;
    let subtotal = 0;
    let subtotalWithOutTaxes = 0;
    let total = 0;
    let taxesTotal = 0;
    let discountsTotal = 0;
    let price = 0;

    app.models.Product.findOne({ where: { id: this.productId } }).then(function (product) {
      price = product.price;

      subtotal = price * self.quantity;
      subtotalWithOutTaxes = subtotal / 1.13;
      taxesTotal = subtotal - subtotalWithOutTaxes;

      if (self.discountAmount > 0) {
        discountsTotal = subtotal * (self.discountAmount / 100);
      }

      total = subtotal - discountsTotal;

      self.price = price;
      self.subtotal = subtotal;
      self.taxesTotal = taxesTotal;
      self.discountsTotal = discountsTotal;
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
