var mongoose = require('mongoose');

var searchTagSchema = new mongoose.Schema({
    search_tag: String
});
module.exports = mongoose.model("search_tag", searchTagSchema);