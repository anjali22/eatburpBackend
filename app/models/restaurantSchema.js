var mongoose = require('mongoose');

//restaurant data
var restaurantSchema = new mongoose.Schema({
    restaurant_name: String,
    address: {
        building: String,
        latitude: Number,
        longitude: Number,  
        street: String,
        locality: String,
        zipcode: String
    },
    phone_number: String,
    average_cost_for_two: String,
    open_time: String,
    close_time: String,
    rush_hours: String,
    delivery_offered_in_kms: String,
    category: [String],
    payment_mode: [String],
    famous_dishes: [String],
    images: [String],
    days_closed: [String],
    reviews: [String],
    avg_rating: Number
});
module.exports = mongoose.model("restaurants", restaurantSchema);