const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  author: String,
  email: String,
  content: String,
  date: { type: Date, default: Date.now },
});

const blogPostSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  date: { type: Date, default: Date.now },
  comments: [commentSchema],
});

module.exports = mongoose.model("BlogPost", blogPostSchema);
