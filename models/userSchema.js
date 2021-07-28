const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema({
  img_src: {
    type: String,
    required: true,
    default: "../images/user.png",
  },
  datejoin: {
    type: String,
    required: true,
  },
  categoryIntrested: {
    type: Array,
    required: true,
    default: [],
  },
  bio: {
    type: String,
    required: true,
    default: "I am a Tech Geeak",
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  like_id_list: {
    type: Array,
    require: true,
    default: [],
  },
  stared_blog: {
    type: Array,
    require: true,
    default: [],
  },
});
module.exports = mongoose.model("user", blogSchema);
