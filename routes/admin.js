require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("express-flash");
var bodyParser = require("body-parser");
const route = express.Router();
const bcrypt = require("bcrypt");
const Admin = require("../models/adminSchema");
const url =
  "mongodb+srv://AmanKanojiya:aman4203kanojiya@scrollblog.hu7co.mongodb.net/AmanBlogPost?retryWrites=true&w=majority";
const localStrategy = require("passport-local").Strategy;
// // MiddleWares---------------------------------------------------------------
route.use(bodyParser.urlencoded({ extended: false }));
route.use(bodyParser.json());
route.use(flash());
route.use(
  session({
    secret: process.env.SESSION_SECREAT,
    resave: false,
    saveUninitialized: true,
  })
);
// // mongoose connection-------------------------------------------------------
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const con = mongoose.connection;
con.on("open", () => {
  console.log("Connected ........");
});
// //function-------------------------------------------------------------
// route.use(passport.initialize());
// route.use(passport.session());

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   //setup user model
//   Admin.findById(id, (err, user) => {
//     done(err, user);
//   });
// });

// passport.use(
//   new localStrategy((username, password, admin_name, passID, done) => {
//     Admin.findOne({ Admin_ID: username }, (err, user) => {
//       if (err) return done(err);
//       if (!user) return done(null, false, { message: "Incorrect Admin ID" });
//       if (admin_name === user.Admin_name && passID === user.PassID) {
//         bcrypt.compare(password, user.password, (err, res) => {
//           if (err) return done(err);
//           if (res === false)
//             return done(null, false, { message: "Incorrect Password" });
//           return done(null, user);
//         });
//       }
//     });
//   })
// );
// function idloggedIn(req, res, next) {
//   if (req.isAuthenticated()) return next();
//   res.redirect("/admin/login");
// }
// function idloggedOut(req, res, next) {
//   if (!req.isAuthenticated()) return next();
//   res.redirect("/admin/");
// }
// // // -----------------------------------------------------------------------
route.get("/login", (req, res) => {
  res.render("adminLogin", { layout: "extra" });
});

route.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/admin/",
    failureRedirect: "/admin/login?error=true",
    failureFlash: true,
  })
);

route.get("/", (req, res) => {
  res.render("adminMain", { layout: "extra" });
});

// route.post("/", (req, res) => {
//   res.render("adminMain", { layout: "extra" });
// });

route.post("/", async (req, res) => {
  const passwordhash = await bcrypt.hash(req.body.password, 10);
  const content = new Admin({
    Admin_name: req.body.admin_name,
    Admin_ID: req.body.username,
    password: passwordhash,
    PassID: req.body.passID,
  });
  console.log("I worked");
  try {
    const al = await content.save();
    console.log(al);
    res.json({ message: "SUCCESS" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = route;
