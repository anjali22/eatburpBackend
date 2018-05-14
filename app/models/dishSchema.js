var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var dishSchema = new mongoose.Schema({
    dish_name: String,
    cuisine: String,
    meal: String,
    search_tag: [String],
    images: [String],
    type: String
});
module.exports = mongoose.model("dishes", dishSchema);