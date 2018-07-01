var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
    review_id: Number,
    review: String,
    user_id: String,
    rating: Number,
    images: [String],
    recommended: Boolean,
    date: String
});

module.exports = mongoose.model("reviews", reviewSchema);