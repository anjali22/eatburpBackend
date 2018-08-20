var mongoose = require('mongoose');
var reviewsSchema = require('./reviewSchema').schema;
var reviewRef = require('./reviewSchema')

var dishRestaurantMappingSchema = new mongoose.Schema({
    restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurants' }, //index 
    restaurant_name: String,
    locality: String,
    dish_id: { type: mongoose.Schema.Types.ObjectId, ref: 'dishes' }, //index
    dish_name: String,
    meal: String,
    cuisine: String,
    price: Number,
    dish_category: String,
    review_id: [{review_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'reviews' }, rating: Number }], //index
    average_rating: Number, //index
    images: [String],
    recommended: Number,
    search_tag: [String],
    reviews: {
        type: [reviewsSchema]
    },
    review_counts: Number,
    experimental_dish: Boolean
});

module.exports = mongoose.model("dish_restaurant_mappings", dishRestaurantMappingSchema);