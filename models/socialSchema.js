const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema({
  img_src: {
    type: String,
    required: true,
    default: "../images/default56.jpeg",
  },
  date: {
    type: String,
    required: true,
  },
  category: {
    type: Array,
    required: true,
    default: [],
  },
  views: {
    type: Number,
    required: true,
    default: 0,
  },
  auther: {
    type: String,
    required: true,
    default: "Aman Kanojiya",
  },
});
module.exports = mongoose.model("socialmedia", blogSchema);
