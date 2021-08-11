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
const Admin = require("./models/adminSchema");
const bodyParser = require("body-parser");
const content = require("./data/blog");
const category = require("./data/category");
const url =
  "mongodb+srv://AmanKanojiya:aman4203kanojiya@scrollblog.hu7co.mongodb.net/AmanBlogPost?retryWrites=true&w=majority";
const localStrategy = require("passport-local").Strategy;
const { error, Console } = require("console");
const app = express();
// const adminRouter = require("./routes/admin");
// app.use("/admin", adminRouter);
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
const environment = process.env.SESSION_SECREAT;
app.use(
  session({
    secret: environment,
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
async function AdminAccess(req, res, next) {
  if (!req.isAuthenticated()) {
  }
  res.redirect("/logout");
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
    res.redirect("/contact");
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
    content_comment: req.body.comment.replace(/<[^>]*>?/gm, " "),
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
  res.render("signup", { layout: "extra", error: "" });
});

app.post("/signup", async (req, res) => {
  const hash_password = await bcrypt.hash(req.body.password, 10);
  const olddata = await User.find();
  var sameContent = true;
  olddata.forEach((each) => {
    if (each.username == req.body.username || each.email == req.body.email) {
      sameContent = false;
    }
  });
  if (sameContent && req.body.password == req.body.cpassword) {
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
  } else {
    res.render("signup", {
      layout: "extra",
      error: "User With this UserName or Email Already exists",
    });
  }
});
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/profile", idloggedIn, async (req, res) => {
  const data = await User.findById(req.user.id);
  try {
    res.render("profile", {
      layout: "extra",
      title: "Profile | Me",
      data: data.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function verifyAdmin(req, res) {
  const id = req.user.id;
  var data1 = await User.findById(id);
  data1 = data1.toJSON();
  const username = data1.username;
  var final = false;
  await Admin.findOne({ Admin_ID: data1.email }, async (err, user) => {
    if (err) {
      final = false;
    }
    if (user != null) {
      if (username === user.Admin_name) {
        final = true;
      } else {
        final = false;
      }
    } else {
      final = false;
    }
  });
  return final;
}

app.get("/admin", idloggedIn, async (req, res) => {
  const verify = await verifyAdmin(req, res);
  if (verify) {
    const contact_data = await Contact.find();
    res.render("adminMain", {
      layout: "admin",
      contact_data: contact_data.map((each) => each.toJSON()),
    });
  } else {
    res.redirect("/");
  }
});

app.post("/admin/blog", idloggedIn, async (req, res) => {
  const verify = verifyAdmin(req);
  if (verify) {
    const category = req.body.category.split(",");
    console.log(category);
    const user_new = new BlogPost({
      img_src: req.body.img_src,
      date: new Date().toLocaleString(),
      title: req.body.title,
      content: req.body.content,
      slug: req.body.slug,
      category: category,
    });
    try {
      const al = await user_new.save();
      res.redirect("/admin");
    } catch (err) {
      res.status(500).json({ message: err.message });
      res.redirect("/admin");
    }
  } else {
    res.redirect("/");
  }
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Blog app listening at http://localhost:${port}`);
});
