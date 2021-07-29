const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  feedback: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("contact", blogSchema);
