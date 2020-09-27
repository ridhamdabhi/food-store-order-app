/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  primaryKey: "email",
  attributes: {
    createdAt: false,
    updatedAt: false,

    email: {
      type: "string",
      required: true,
    },
    active: {
      type: "boolean",
      defaultsTo: false,
    },
    password: {
      type: "string",
      required: true,
    },
    secretToken: {
      type: "string",
    },
  },
};
