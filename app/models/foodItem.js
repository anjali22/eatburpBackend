var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

//restaurant data
var foodItemSchema = new mongoose.Schema({
    name: String,
    cuisine: String,
    meal: String,
    tags: [String],
    images: [String]
});
module.exports = mongoose.model("foodItem", foodItemSchema);