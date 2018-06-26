var mongoose = require('mongoose');

var dishRestaurantMappingSchema = new mongoose.Schema({
    id: Number,
    restaurant_id: String,
    dish_id: String,
    price: Number,
    dish_category: String,
    review_id: [String],
    average_rating: Number,
    images: [String],
    recommended: Number,
    dish_name: String,
    restaurant_name: String
});

module.exports = mongoose.model("dish_restaurant_mappings", dishRestaurantMappingSchema);