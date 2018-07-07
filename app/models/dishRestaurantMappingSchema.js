var mongoose = require('mongoose');

var dishRestaurantMappingSchema = new mongoose.Schema({
    restaurant_id: String, //index 
    dish_id: String, //index
    price: Number,
    dish_category: String,
    review_id: [String], //index
    average_rating: Number, //index
    images: [String],
    recommended: Number,
    dish_name: String,
    restaurant_name: String
});

module.exports = mongoose.model("dish_restaurant_mappings", dishRestaurantMappingSchema);