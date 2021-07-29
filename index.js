require("dotenv").config();
const express = require("express");
const session = require("express-session");
var exphb = require("express-handlebars");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const BlogPost = require("./models/blogSchema");
const Comment = require("./models/commentSchema");
const SocialMedia = require("./models/socialSchema");
const Contact = require("./models/contactSchema");
const User = require("./models/userSchema");
const bodyParser = require("body-parser");
const content = require("./data/blog");
const category = require("./data/category");
const url = "mongodb://localhost/AmanBlogPost";
const localStrategy = require("passport-local").Strategy;
const app = express();

const hbs = exphb.create({
  helpers: {
    rank: function (value) {
      return value + 1;
    },
    subString: function (value) {
      return value.slice(0, 300);
    },
  },
});

// mongoose connection-------------------------------------------------------
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const con = mongoose.connection;
con.on("open", () => {
  console.log("Connected ........");
});

// Middlewares ---------------------------------------------------------
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.use(express.static(path.join(__dirname, "assets")));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECREAT,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// passport js ---------------------------------------------------
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  //setup user model
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  new localStrategy((username, password, done) => {
    User.findOne({ email: username }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false, { message: "Incorrect Email" });
      bcrypt.compare(password, user.password, (err, res) => {
        if (err) return done(err);
        if (res === false)
          return done(null, false, { message: "Incorrect Password" });
        return done(null, user);
      });
    });
  })
);

function idloggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}
function idloggedOut(req, res, next) {
  if (!req.isAuthenticated()) return next();
  res.redirect("/");
}
// Requests ---------------------------------------------------------------

app.get("/", idloggedIn, async (req, res) => {
  try {
    const blogs = await BlogPost.find();
    const social = await SocialMedia.find();
    topPost = blogs.slice(0, 5);
    topSocial = social.slice(0, 6);
    res.render("index", {
      blogs: blogs.map((blog) => blog.toJSON()),
      category,
      topPost: topPost.map((post) => post.toJSON()),
      topSocial: topSocial.map((pic) => pic.toJSON()),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/", idloggedIn, async (req, res) => {
  const blog = new BlogPost({
    date: new Date().toLocaleString(),
    title: req.body.title,
    content: req.body.content,
    slug: req.body.slug,
    category: req.body.category.split(","),
  });
  try {
    const al = await blog.save();
    res.json(al);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/about", idloggedIn, (req, res) => {
  res.render("about", { layout: "extra", title: "About" });
});

app.get("/contact", idloggedIn, (req, res) => {
  res.render("contact", {
    layout: "extra",
    title: "Contact",
  });
});

app.post("/contact", idloggedIn, async (req, res) => {
  const contact = await new Contact({
    date: new Date().toLocaleString(),
    user_id: req.user.id,
    name: req.body.name,
    feedback: req.body.feedback,
    email: req.body.email,
  });
  try {
    const al = await contact.save();
    res.redirect("/contact", {
      message: "FeedBack added We will contact Soon",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  re.redirect("/contact");
});

app.get("/blogpage/:slug/:id", idloggedIn, async (req, res) => {
  try {
    const blog_content = await BlogPost.findById(req.params.id);
    const blogs = await BlogPost.find();
    const comments = await Comment.find({ post_id: req.params.id });
    topPost = blogs.slice(0, 5);
    res.render("blogpage", {
      blog_content: blog_content.toJSON(),
      category,
      topPost: topPost.map((post) => post.toJSON()),
      comments: comments.map((each) => each.toJSON()),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/blogpage/:slug/:id", idloggedIn, async (req, res) => {
  var user_name = await User.findById(req.user.id);
  user_name = user_name.username;
  const comment = await new Comment({
    date: new Date().toLocaleString(),
    user_id: req.user.id,
    user_name: user_name,
    post_id: req.params.id,
    content_comment: req.body.comment,
  });
  try {
    const al = await comment.save();
    res.redirect(`/blogpage/${req.params.slug}/${req.params.id}`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/category/:slug", idloggedIn, async (req, res) => {
  try {
    const content = await BlogPost.find();
    var category = content.filter((content_each) => {
      get = false;
      content_each.category.forEach((element) => {
        if (req.params.slug == element) {
          get = true;
        }
      });
      return get;
    });
    res.render("category", {
      category: category.map((each) => each.toJSON()),
      category_name: req.params.slug,
      layout: "extra",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// app.get("/comment", async (req, res) => {
//   console.log("request comment");
//   const comment = await Comment.find();
//   res.json(comment);
// });

app.post("/socialmedia", idloggedIn, async (req, res) => {
  const social = new SocialMedia({
    date: new Date().toLocaleString(),
    img_src: req.body.img_src,
  });
  try {
    const al = await social.save();
    res.json(al);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/login", idloggedOut, (req, res) => {
  res.render("login", { layout: "extra" });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login?error=true",
    failureFlash: true,
  })
);

app.get("/signup", idloggedOut, (req, res) => {
  res.render("signup", { layout: "extra" });
});

app.post("/signup", async (req, res) => {
  const hash_password = await bcrypt.hash(req.body.password, 10);
  const user_new = new User({
    datejoin: new Date().toLocaleString(),
    username: req.body.username,
    email: req.body.email,
    password: hash_password,
  });
  try {
    const al = await user_new.save();
    res.redirect("/login");
  } catch (err) {
    res.status(500).json({ message: err.message });
    res.redirect("/signup");
  }
});
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/profile", (req, res) => {
  res.render("profile", { layout: "extra" });
});
app.listen(process.env.PORT, () => {
  console.log(`Blog app listening at http://localhost:${process.env.PORT}`);
});
