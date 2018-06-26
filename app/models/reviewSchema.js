var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
    review_id: Number,
    comment_id: Number,
    review: String,
    user_id: String,
    rating: Number,
    imageUrl: [String],
    recommended: Boolean
});

module.exports = mongoose.model("reviews", reviewSchema);