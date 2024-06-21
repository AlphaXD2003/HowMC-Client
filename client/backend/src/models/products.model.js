const { Types, Schema, model } = require("mongoose");

const ProductSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: "No description provided",
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  eggs: {
    type: [Types.ObjectId],
    ref: "Egg",
  },
});

const Product = model("Product", ProductSchema);
module.exports = Product;
