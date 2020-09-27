/**
 * Order.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  primaryKey: "id",
  attributes: {
    email: {
      type: "string",
      required: true,
    },
    //Status: Placed or In progress
    status: {
      type: "string",
      required: true,
    },
    productID: {
      type: "string",
      required: true,
    },
    productName: {
      type: "string",
      required: true,
    },
    qty: {
      type: "number",
      required: true,
    },
    priceEach: {
      type: "number",
      required: true,
    },
    amount: {
      type: "number",
      required: true,
    },
  },
};
