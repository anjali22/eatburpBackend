var employees = require('../../app/models/employeeSchema');

var bodyParser = require('body-parser');
var Promise = require('promise');
var express = require('express');
var bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');

var app = express();

app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}));

module.exports = function employeesAPI(app) {

    app.post("/angularSignUp", (req, res) => {
        employees.findOne({ email: req.body.email }, function (err, user) {
            if (err) throw err;
            if (user) {
                res.status(400).json({
                    error: "User already registered. Please login."
                })
            } else {
                var newUser = new employees(req.body);
                console.log('newUser-----------', newUser);
                newUser.password = newUser.generateHash(req.body.password);
                newUser.save(function (err) {
                    if (err) throw err;
                })
                    .then(item => {
                        console.log('item--------', item)
                        const JWTToken = jwt.sign({
                            _id: item._id
                        },
                            process.env.JWT_SECRET,
                        );
                        res.status(200).json({
                            success: 'Welcome to the JWT Auth',
                            token: JWTToken,
                            user: {
                                name: item.first_name + ' ' + item.last_name,
                                email: item.email
                            }
                        });
                    })
                    .catch(err => {
                        res.status(400).json({ error: "Unable to sign up." });
                    });
            }
        })

    });

    /* app.options("/angularSignIn", (req, res) => {
        console.log("options successful");
    }) */

    app.post("/angularSignIn", (req, res) => {
        console.log(req.body);
        employees.find({ email: req.body.email }, function (err, user) {
            console.log(user);
            if (err) {
                res.send(err)
            } else if (!user) {
                res.status(401).json({
                    error: 'Please register as new user'
                });
            } else if (!validPassword(req.body.password, user[0].password)) {
                res.status(401).json({
                    error: 'Please enter correct password'
                });
            } else {
                console.log('user-------', user[0]._id)
                const JWTToken = jwt.sign({
                    _id: user[0]._id
                },
                    process.env.JWT_SECRET,
                );
                console.log(JWTToken);
                res.status(200).json({
                    success: 'Welcome to the JWT Auth',
                    token: JWTToken,
                    user: {
                        name: user[0].first_name + ' ' +  user[0].last_name,
                        email: user[0].email
                    }
                });
            }
        })
    });

    var validPassword = function (password1, password) {
        //console.log("here------------", password, password1)
        var value = bcrypt.compareSync(password1, password);
        console.log(value);
        return value;
    };
}
