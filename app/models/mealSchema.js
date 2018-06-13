var mongoose = require('mongoose');

var mealSchema = new mongoose.Schema({
    meal_name: String
});
module.exports = mongoose.model("meals", mealSchema);