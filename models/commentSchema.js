const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    default: "AMAN",
  },
  post_id: {
    type: String,
    required: true,
  },
  content_comment: {
    type: String,
    required: true,
  },
  like_dislike: {
    type: Array,
    require: true,
    default: [0, 0],
  },
  date: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("comment", commentSchema);
