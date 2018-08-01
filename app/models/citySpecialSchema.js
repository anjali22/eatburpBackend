var mongoose = require('mongoose');

var citySpecialSchema = new mongoose.Schema({
    city_name: String,
    city_special_dishes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'dishes' }],
    city_special_restaurant_dish: [{ type: mongoose.Schema.Types.ObjectId, ref: 'dish_restaurant_mappings'}]
});
module.exports = mongoose.model("city_specials", citySpecialSchema);