/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` your home page.            *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  "GET /": "UserController.viewHome",
  "GET /logout": "UserController.logout",
  "GET /login": "UserController.viewLogin",
  "GET /register": "UserController.viewRegister",
  "POST /register": "UserController.addUser",
  "POST /login": "UserController.checkUser",
  "GET /verify/:secretToken": "UserController.verify",
  "GET /viewProducts": "OrderController.getProducts",
  "POST /viewProduct": "OrderController.getProduct",
  "POST /addProduct": "OrderController.addProduct",
  "POST /addToCart": "OrderController.addToCart",
  "POST /deleteOrderItem": "OrderController.deleteOrderItem",
  "GET /confirmOrder": "OrderController.confirmOrder",
  "GET /viewCart": "OrderController.viewCart",

  /***************************************************************************
   *                                                                          *
   * More custom routes here...                                               *
   * (See https://sailsjs.com/config/routes for examples.)                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the routes in this file, it   *
   * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
   * not match any of those, it is matched against static assets.             *
   *                                                                          *
   ***************************************************************************/
};
