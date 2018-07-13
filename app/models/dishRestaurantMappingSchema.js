var mongoose = require('mongoose');
var reviewsSchema = require('./reviewSchema').schema;
var reviewRef = require('./reviewSchema')

var dishRestaurantMappingSchema = new mongoose.Schema({
    restaurant_id: String, //index 
    dish_id: String, //index
    price: Number,
    dish_category: String,
    review_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'reviews' }], //index
    average_rating: Number, //index
    images: [String],
    recommended: Number,
    dish_name: String,
    restaurant_name: String,
    search_tag: [String],
    reviews: {
        type: [reviewsSchema],
        validate:[reviewLimit, 'You have reached the limit']
    }
});

function reviewLimit(value) {
    return value.length<=3;
}

module.exports = mongoose.model("dish_restaurant_mappings", dishRestaurantMappingSchema);