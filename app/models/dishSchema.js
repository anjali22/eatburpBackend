var mongoose = require('mongoose');

var dishSchema = new mongoose.Schema({
    dish_name: String, //index
    cuisine: String, // index
    meal: String,
    search_tag: [String], //index
    images: [String],
    type: String
});
module.exports = mongoose.model("dishes", dishSchema);