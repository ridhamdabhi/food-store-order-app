/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const randomstring = require("randomstring");
const nodemailer = require("nodemailer");

module.exports = {
  viewHome: function (req, res) {
    var currentUser = req.session.currentUser;
    if (currentUser) {
      res.view("pages/homepage", { layout: "layouts/loggedIn" });
    } else {
      res.view("pages/homepage");
    }
  },

  viewLogin: function (req, res) {
    var currentUser = req.session.currentUser;
    if (currentUser) {
      res.view("pages/homepage", { layout: "layouts/loggedIn" });
    } else {
      res.view("pages/login", { success_message: false, error_message: false });
    }
  },

  viewRegister: function (req, res) {
    var currentUser = req.session.currentUser;
    if (currentUser) {
      res.view("pages/homepage", { layout: "layouts/loggedIn" });
    } else {
      res.view("pages/register", {
        success_message: false,
        error_message: false,
      });
    }
  },

  addUser: function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;
    var secretToken = randomstring.generate(30);

    if (password != confirmPassword) {
      res.view("pages/register", {
        success_message: false,
        error_message: "Passwords do not match. Try again.",
      });
    } else {
      User.find({ email: email }).exec(function (err, user) {
        if (err) {
          res.send(500, { error: "Database Error" });
        }
        if (user.length) {
          res.view("pages/register", {
            success_message: false,
            error_message: "User with email (" + email + ") already exists.",
          });
        } else {
          User.create({
            email: email,
            password: password,
            secretToken: secretToken,
          }).exec(function (err) {
            if (err) {
              res.view("pages/register", {
                success_message: false,
                error_message:
                  "Sorry, There was an error while registering the user.",
              });
            }

            var transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "orderappgroup10@gmail.com",
                pass: "mailgroup10",
              },
            });
            var mailContent =
              '<CENTER><H3><B><p>You can verify your OrderApp account using this <A href="http://localhost:1337/verify/' +
              secretToken +
              '">link</A>.</p></B></H4></CENTER>';
            var mailOptions = {
              from: "orderappgroup10@gmail.com",
              to: email,
              subject: "Activate your OrderApp Account!",
              html: mailContent,
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                res.send(500, { error: error });
              }
            });

            res.view("pages/login", {
              success_message:
                "Successfully Registered. An email with the confirmation link is sent to the registered email address.",
              error_message: false,
            });
          });
        }
      });
    }
    return false;
  },

  checkUser: function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    User.findOne({ email: email, password: password }).exec(function (
      err,
      user
    ) {
      if (err) {
        res.view("pages/login", {
          error_message: "Database Error",
          success_message: false,
        });
      }
      if (user) {
        if (user.active == 1) {
          req.session.currentUser = user;
          res.view("pages/loginSuccess", { layout: "layouts/loggedIn" });
        } else {
          res.view("pages/login", {
            error_message:
              "The user profile is not active yet. Check and verify your email to activate your account.",
            success_message: false,
          });
        }
      } else {
        res.view("pages/login", {
          error_message: "Invalid Credentials. Try Again",
          success_message: false,
        });
      }
    });
  },

  verify: function (req, res) {
    var secretToken = req.params.secretToken;
    User.update({ secretToken: secretToken }, { active: true }).exec(function (
      err
    ) {
      if (err) {
        res.send(500, { error: "Database Error" });
      }

      res.view("pages/login", {
        success_message: "Account successfully verified. You can log in now.",
        error_message: false,
      });
    });
    return false;
  },

  logout: function (req, res) {
    req.session.destroy();
    res.view("pages/homepage", { layout: "layouts/layout" });
  },
};
