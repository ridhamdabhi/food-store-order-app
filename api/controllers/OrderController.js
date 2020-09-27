/**
 * OrderController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  getProducts: function (req, res) {
    //Url of StoreApp getProducts
    let url =
      "https://v8nokd46w9.execute-api.us-east-1.amazonaws.com/default/getAllProducts";

    fetch(url)
      .then((res) => res.json())
      .then((products) => {
        if (req.session.currentUser) {
          res.view("pages/viewProducts", {
            products: products,
            layout: "layouts/loggedIn",
          });
        } else {
          res.view("pages/viewProducts", { products: products });
        }
      })
      .catch((err) => {
        throw err;
      });
  },

  getProduct: function (req, res) {
    var productID = req.body.productID;
    var productName = req.body.productName;
    var productPrice = req.body.productPrice;

    const body = { id: productID };

    let url =
      "https://v8nokd46w9.execute-api.us-east-1.amazonaws.com/default/getProductById";

    fetch(url, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((productIngredients) => {
        if (req.session.currentUser) {
          res.view("pages/viewProduct", {
            productIngredients: productIngredients,
            productID: productID,
            productName: productName,
            productPrice: productPrice,
            layout: "layouts/loggedIn",
          });
        } else {
          res.view("pages/viewProduct", {
            productIngredients: productIngredients,
            productID: productID,
            productName: productName,
            productPrice: productPrice,
          });
        }
      })
      .catch((err) => {
        throw err;
      });
  },

  addProduct: async function (req, res) {
    if (req.session.currentUser) {
      var productID = req.body.productID;
      var productName = req.body.productName;
      var productPrice = req.body.productPrice;
      var qtyMax;
      const bodyProduct = { id: productID };

      let productIngredientsUrl =
        "https://v8nokd46w9.execute-api.us-east-1.amazonaws.com/default/getProductById";

      let ingredientsUrl =
        "https://ingredientsappcloud.azurewebsites.net/getIngredientByID";

      let response = await fetch(productIngredientsUrl, {
        method: "post",
        body: JSON.stringify(bodyProduct),
        headers: { "Content-Type": "application/json" },
      });
      response = await response.json();

      for (let index in response) {
        var bodyIngredient = { id: response[index].ingredient_id };

        let ingredientResponse = await fetch(ingredientsUrl, {
          method: "post",
          body: JSON.stringify(bodyIngredient),
          headers: { "Content-Type": "application/json" },
        });
        ingredientResponse = await ingredientResponse.json();

        var quantity = Number(response[index].quantity);
        var quantityAvailable = Number(ingredientResponse.ingredientQoh);
        var q = Math.floor(quantityAvailable / quantity);
        if (qtyMax == undefined) {
          qtyMax = q;
        } else if (qtyMax > q) {
          qtyMax = q;
        }
      }
      if (qtyMax > 5) {
        qtyMax = 5;
      }
      if (req.session.currentUser) {
        res.view("pages/addProduct", {
          productID: productID,
          productName: productName,
          productPrice: productPrice,
          qtyMax: qtyMax,
          layout: "layouts/loggedIn",
        });
      } else {
        res.view("pages/addProduct", {
          productID: productID,
          productName: productName,
          productPrice: productPrice,
          qtyMax: qtyMax,
        });
      }
    } else {
      res.view("pages/login", {
        error_message:
          "To add products to cart, you will need to log in first.",
        success_message: false,
      });
    }
  },

  addToCart: function (req, res) {
    var productID = req.body.productID;
    var productName = req.body.productName;
    var qty = Number(req.body.qty);
    var productPrice = Number(req.body.productPrice);
    var email = req.session.currentUser.email;
    var amount = productPrice * qty;
    Order.create({
      email: email,
      status: "pending",
      productID: productID,
      productName: productName,
      qty: qty,
      amount: amount,
      priceEach: productPrice,
    }).exec(function (err) {
      if (err) {
        res.send(500, { error: "Database Error" });
      }
      res.redirect("/viewCart");
    });
  },

  viewCart: function (req, res) {
    if (!req.session.currentUser) {
      res.view("pages/homepage");
    } else {
      var email = req.session.currentUser.email;
      Order.find({ email: email, status: "pending" }).exec(function (
        err,
        orderItems
      ) {
        if (err) {
          res.send(500, { error: "Database Error" });
        }
        res.view("pages/viewCart", {
          orderItems: orderItems,
          layout: "layouts/loggedIn",
        });
      });
      return false;
    }
  },

  confirmOrder: async function (req, res) {
    if (!req.session.currentUser) {
      res.view("pages/homepage");
    } else {
      var email = req.session.currentUser.email;
      Order.find({ email: email, status: "pending" }).exec(async function (
        err,
        orderItems
      ) {
        if (err) {
          res.send(500, { error: "Database Error" });
        }

        var ingredientsArr = [];
        var productArr = [];
        var bodyProduct;
        var qty;
        let productIngredientsUrl =
          "https://v8nokd46w9.execute-api.us-east-1.amazonaws.com/default/getProductById";

        for (let index1 in orderItems) {
          bodyProduct = { id: orderItems[index1].productID };
          let response = await fetch(productIngredientsUrl, {
            method: "post",
            body: JSON.stringify(bodyProduct),
            headers: { "Content-Type": "application/json" },
          });
          response = await response.json();
          productArr.push({
            id: orderItems[index1].productID,
            quantity: String(orderItems[index1].qty),
          });
          for (let index2 in response) {
            qty =
              Number(response[index2].quantity) *
              Number(orderItems[index1].qty);
            ingredientsArr.push({
              id: Number(response[index2].ingredient_id),
              quantity: qty,
            });
          }
        }
        let transactionID = uuidv4();
        const transactionBody = {
          id: transactionID,
          action: "commit",
          ingredients: ingredientsArr,
        };
        let ingredientTransaction =
          "https://ingredientsappcloud.azurewebsites.net/transaction";

        let response = await fetch(ingredientTransaction, {
          method: "post",
          body: JSON.stringify(transactionBody),
          headers: { "Content-Type": "application/json" },
        });
        response = await response.json();

        if (response.status == "failed") {
          Order.update({ email: email }, { status: "failed" }).exec(function (
            err
          ) {
            if (err) {
            }
            res.view("pages/homepage", {
              layout: "layouts/loggedIn",
            });
          });

          return false;
        } else if (response.status == "success") {
          const bakeryBody = {
            id: transactionID,
            action: "commit",
            products: productArr,
          };

          let productTransaction =
            "https://v8nokd46w9.execute-api.us-east-1.amazonaws.com/default/transaction";

          let response = await fetch(productTransaction, {
            method: "post",
            body: JSON.stringify(bakeryBody),
            headers: { "Content-Type": "application/json" },
          });
          response = await response.json();
        }
      });
      Order.update({ email: email }, { status: "confirmed" }).exec(function (
        err
      ) {
        if (err) {
        }
        res.view("pages/successOrder", {
          layout: "layouts/loggedIn",
        });
      });

      return false;
    }
  },

  deleteOrderItem: function (req, res) {
    Order.destroy({ id: req.body.id }).exec(function (err) {
      if (err) {
        res.send(500, { error: "Database Error" });
      }
      res.redirect("/viewCart");
    });
    return false;
  },
};
