var mongoose = require('mongoose');

var restoItemSchema = new mongoose.Schema({
    id: Number,
    resto_id: String,
    //item_id: {id: mongoose.Schema.Types.ObjectId, name: String },
    item_id: String,
    //review_id: [mongoose.Schema.Types.ObjectId],
    cost: Number,
    //user_id: mongoose.Schema.Types.ObjectId,
    review_id: [String],
    avg_rating: Number,
});

module.exports = mongoose.model("resto_item_ratings", restoItemSchema);