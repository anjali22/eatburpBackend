var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

//restaurant data
var restoSchema = new mongoose.Schema({
    name: String,
    address: {
        building: String,
        coord: [Number],
        streat: String,
        locality: String,
        zipcode: Number
    },
    phone: String,
    avg_cost_two: Number,
    openTime: String,
    closeTime: String,
    category: [String],
    famousFor: [String],
    images: [String]
});
module.exports = mongoose.model("restaurants", restoSchema);