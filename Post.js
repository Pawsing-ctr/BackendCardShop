const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  photo: { type: String },
});

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
