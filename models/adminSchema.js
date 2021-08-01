const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
  Admin_name: {
    type: String,
    required: true,
  },
  Admin_ID: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  PassID: {
    type: Number,
    required: true,
  },
  permissions: {
    type: Array,
    required: true,
    default: [],
  },
});
module.exports = mongoose.model("Admin", adminSchema);
