var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

//restaurant data
var restoSchema = new mongoose.Schema({
    name: String,
    locality: String,
});
module.exports = mongoose.model("restaurants", restoSchema);