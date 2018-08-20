var mongoose = require('mongoose');
var reviewsSchema = require('./reviewSchema').schema;

//restaurant data
var restaurantSchema = new mongoose.Schema({
    restaurant_name: String, //index
    address: {
        building: String,
        latitude: Number,   //index
        longitude: Number,  //index
        street: String,
        locality: String, 
        city: String,
        zipcode: String,
        state: String,
        country: String
    },
    phone_number: String,
    average_cost_for_two: Number,
    open_time: String,
    close_time: String,
    rush_hours: String,
    delivery_offered_in_kms: String,
    category: [String],
    payment_mode: [String],
    famous_dishes: [String],
    images: [String],
    days_closed: [String],
    reviews: {
        type: [reviewsSchema]
    },
    average_rating: Number, //index
    cuisines: [String],
    recommended: Number,
    review_id: [{ review_id: { type: mongoose.Schema.Types.ObjectId, ref: 'reviews' }, rating: Number }], //index
    experimental_dishes: [{type: mongoose.Schema.Types.ObjectId, ref: 'dishes'}],
    review_counts: Number
});
module.exports = mongoose.model("restaurants", restaurantSchema);