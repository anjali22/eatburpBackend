var mongoose = require('mongoose');

var dishSchema = new mongoose.Schema({
    dish_name: String,
    cuisine: String,
    meal: String,
    search_tag: [String],
    images: [String],
    type: String
});
module.exports = mongoose.model("dishes", dishSchema);