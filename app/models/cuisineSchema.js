var mongoose = require('mongoose');

var cuisineSchema = new mongoose.Schema({
    cuisine_name: String
});
module.exports = mongoose.model("cuisines", cuisineSchema);