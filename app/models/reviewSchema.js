var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
    review_id: Number,
    review: String,
    user: {
        user_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users'}],    //index
        first_name: String,
        last_name: String
    }, 
    rating: Number,
    images: [String],
    recommended: Boolean,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("reviews", reviewSchema);