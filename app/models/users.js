// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    no_of_recommendations: 0,
    no_of_reviews: 0,
    image: String,
    foodie_level: 0,
    phone_number: String,
    address: {
        building: String,
        latitude: Number,
        longitude: Number,
        street: String,
        locality: String,
        city: String,
        zipcode: String,
        state: String,
        country: String
    },
    facebook_id: String,
    facebook_token: String,
    google_id: String,
    google_token: String,

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('users', userSchema);