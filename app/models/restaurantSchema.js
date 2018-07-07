var mongoose = require('mongoose');

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
    average_rating: Number, //index
    cuisines: [String]
});
module.exports = mongoose.model("restaurants", restaurantSchema);