const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
var exphb = require("express-handlebars");
const bcrypt = require("bcrypt");
const BlogPost = require("./models/blogSchema");
const Comment = require("./models/commentSchema");
const SocialMedia = require("./models/socialSchema");
const User = require("./models/userSchema");
const bodyParser = require("body-parser");

const content = require("./data/blog");
const category = require("./data/category");
const { count, countDocuments } = require("./models/blogSchema");
const { constants } = require("os");
const url = "mongodb://localhost/AmanBlogPost";

const app = express();
const port = 3000;

const hbs = exphb.create({
  helpers: {
    rank: function (value) {
      return value + 1;
    },
  },
});

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const con = mongoose.connection;

con.on("open", () => {
  console.log("Connected ........");
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.use(express.static(path.join(__dirname, "assets")));
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
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

app.post("/", async (req, res) => {
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

app.get("/about", (req, res) => {
  res.render("about", { layout: "extra", title: "About" });
});

app.get("/contact", (req, res) => {
  res.render("contact", { layout: "extra", title: "Contact" });
});

app.get("/blogpage/:slug/:id", async (req, res) => {
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

app.post("/blogpage/:slug/:id", async (req, res) => {
  const comment = new Comment({
    date: new Date().toLocaleString(),
    post_id: req.params.id,
    content_comment: req.body.comment,
  });
  try {
    const al = await comment.save();
    console.log(al);
    res.redirect(`/blogpage/${req.params.slug}/${req.params.id}`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/category/:slug", async (req, res) => {
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

app.post("/socialmedia", async (req, res) => {
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

app.get("/login", (req, res) => {
  res.render("login", { layout: "extra" });
});

app.post("/login", (req, res) => {
  // res.render("login", { layout: "extra" });
  res.redirect("/");
});

app.get("/signup", (req, res) => {
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
  }
});

app.listen(port, () => {
  console.log(`Blog app listening at http://localhost:${port}`);
});
