var mongoose = require('mongoose');

var dishTypeSchema = new mongoose.Schema({
    dish_type: String
});
module.exports = mongoose.model("dish_types", dishTypeSchema);