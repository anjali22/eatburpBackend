var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var employeeSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    added_restaurants_id: [String],
    added_menu_id: [String]
});

// generating a hash
employeeSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

module.exports = mongoose.model("employees", employeeSchema);