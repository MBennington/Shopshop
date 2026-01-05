const joi = require('joi');

module.exports.updateStock = joi.object({
  sales_count: joi.number().integer().min(0).optional(),
  total_earnings: joi.number().min(0).optional(),
  salesCountByColor: joi
    .array()
    .items(
      joi.object({
        colorCode: joi.string().trim().required(),
        colorName: joi.string().trim().required(),
        salesCount: joi.number().integer().min(0).optional(),
        sizes: joi
          .array()
          .items(
            joi.object({
              size: joi.string().trim().required(),
              salesCount: joi.number().integer().min(0).required(),
            })
          )
          .optional(),
      })
    )
    .optional(),
  initial_stock_by_color: joi
    .array()
    .items(
      joi.object({
        colorCode: joi.string().trim().required(),
        colorName: joi.string().trim().required(),
        initialStock: joi.number().integer().min(0).optional(),
        sizes: joi
          .array()
          .items(
            joi.object({
              size: joi.string().trim().required(),
              initialStock: joi.number().integer().min(0).required(),
            })
          )
          .optional(),
      })
    )
    .optional(),
  available_stock_by_color: joi
    .array()
    .items(
      joi.object({
        colorCode: joi.string().trim().required(),
        colorName: joi.string().trim().required(),
        availableStock: joi.number().integer().min(0).optional(),
        sizes: joi
          .array()
          .items(
            joi.object({
              size: joi.string().trim().required(),
              availableStock: joi.number().integer().min(0).required(),
            })
          )
          .optional(),
      })
    )
    .optional(),
  reserved_stock_by_color: joi
    .array()
    .items(
      joi.object({
        colorCode: joi.string().trim().required(),
        colorName: joi.string().trim().required(),
        reservedStock: joi.number().integer().min(0).optional(),
        sizes: joi
          .array()
          .items(
            joi.object({
              size: joi.string().trim().required(),
              reservedStock: joi.number().integer().min(0).required(),
            })
          )
          .optional(),
      })
    )
    .optional(),
  restock_history: joi
    .array()
    .items(
      joi.object({
        date: joi.date().optional(),
        quantity: joi.number().integer().min(0).required(),
        colorCode: joi.string().trim().required(),
        size: joi.string().trim().allow('', null).optional(),
        notes: joi.string().trim().allow('', null).optional(),
      })
    )
    .optional(),
  last_restocked_date: joi.date().allow(null).optional(),
});

module.exports.incrementSales = joi.object({
  product_id: joi.string().trim().required(),
  colorCode: joi.string().trim().required(),
  size: joi.string().trim().allow('', null).optional(),
  quantity: joi.number().integer().min(1).required(),
  price: joi.number().min(0).required(),
});

module.exports.getStockByProduct = joi.object({
  product_id: joi.string().trim().required(),
});

module.exports.getStockBySeller = joi.object({
  seller_id: joi.string().trim().optional(),
  page: joi.number().integer().min(1).optional(),
  limit: joi.number().integer().min(1).max(100).optional(),
});

module.exports.restockProduct = joi.object({
  product_id: joi.string().trim().required(),
  colorCode: joi.string().trim().required(),
  size: joi.string().trim().allow('', null).optional(),
  quantity: joi.number().integer().min(1).required(),
  notes: joi.string().trim().allow('', null).optional(),
});

