var users = require('../../app/models/user');
var reviewSchema = require('../models/reviewSchema');
var dishRestaurantMappingSchema = require('../models/dishRestaurantMappingSchema');
var bodyParser = require('body-parser');
var Promise = require('promise');
var express = require('express');
var bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
var async = require('async');

var app = express();

app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}));

module.exports = function usersAPI(app) {

    app.post("/signUp", (req, res) => {
        users.findOne({ email: req.body.email }, function (err, user) {
            if (err) throw err;
            if (user) {
                res.status(400).json({
                    error: "User already registered. Please login."
                })
            } else {
                var newUser = new users(req.body);
                newUser.first_name = '';
                newUser.last_name = '';
                newUser.no_of_recommendations = 0;
                newUser.no_of_reviews = 0;
                newUser.image = '';
                newUser.foodie_level = 0;
                newUser.phone_number = '';
                newUser.address = {
                    building: '',
                    latitude: 0,
                    longitude: 0,
                    street: '',
                    locality: '',
                    city: '',
                    zipcode: '',
                    state: '',
                    country: ''
                }
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
                        token: JWTToken
                    });
                })
                .catch(err => {
                    res.status(400).json({ error: "Unable to sign up." });
                });
            }
        })

    });

    app.post("/signIn", (req, res) => {
        console.log(req.body);
        users.find({ email: req.body.email }, function (err, user) {
            console.log(user);
            if (err) {
                return res.send(err)
            } else if (!user) {
               return res.status(401).json({
                    error: 'Please register as new user'
                });
            } else if (!validPassword(req.body.password, user[0].password)) {
                return res.status(401).json({
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
                    token: JWTToken
                });
            }
        })
    });

    app.get("/getUserDetails", (req, res) => {
        var user_id;
        var token = req.headers['x-access-token'];
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            else {
                console.log('decoded-----------', decoded);
                user_id = decoded._id
            }
        });
        
        users.findById(user_id, function (err, user) {
            if(err) {
                return res.json({"error": err});
            } else {
                console.log('user', user);
                res.send(user)
            }
        })
    })

    var validPassword = function (password1, password) {
        //console.log("here------------", password, password1)
        var value = bcrypt.compareSync(password1, password);
        console.log(value);
        return value;
    };

    app.get("/getUserReviews", (req, res) => {
        console.log("req.header-------", req.header);
        var user_id;
        var token = req.headers['x-access-token'];
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            else {
                console.log('decoded-----------', decoded);
                user_id = decoded._id
            }
        });

        reviewSchema.find({"user.user_id": user_id}, function name(err, reviews) {
            if (err) {
               return res.status(500).send({ message: 'Please wait for some time and try again.', error: err })
            } else {
                //res.status(200).send({ message: "All good", success: reviews });
                let userReviews = [];
                async.forEachOf(reviews, function (review, index, callback) {
                    dishRestaurantMappingSchema.find({ "review_id": review._id }, function getDishDetail(err, dish) {
                        if (err) {
                            return res.status(500).send({ message: 'Please wait for some time and try again.', error: err })
                        } else {
                            console.log("review_id---------", review._id)
                            console.log("dish detail----------", dish);
                            userReviews[index] = {
                                review: review,
                                dish_detail: dish[0]
                            }
                        }
                        callback(null, userReviews);
                    })
                }, function callbackFunction(err, result) {
                    if(err) {
                        return res.status(500).send({ message: 'Please wait for some time and try again.', error: err })
                    }
                    console.log("over here")
                    res.status(200).send({ message: "All good", success: userReviews });
                })
            }
        })
    });

    app.get("/getUserRecommendation", (req, res) => {
        console.log("req.header-------", req.header);
        var user_id;
        var token = req.headers['x-access-token'];
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            else {
                console.log('decoded-----------', decoded);
                user_id = decoded._id
            }
        });

        reviewSchema.find({ "user.user_id": user_id, "recommended": true }, function name(err, reviews) {
            if (err) {
                return res.status(500).send({ message: 'Please wait for some time and try again.', error: err })
            } else {
                //res.status(200).send({ message: "All good", success: reviews });
                let userReviews = [];
                async.forEachOf(reviews, function (review, index, callback) {
                    dishRestaurantMappingSchema.find({ "review_id": review._id }, function getDishDetail(err, dish) {
                        if (err) {
                            return res.status(500).send({ message: 'Please wait for some time and try again.', error: err })
                        } else {
                            console.log("review_id---------", review._id)
                            console.log("dish detail----------", dish);
                            userReviews[index] = dish[0];
                        }

                        callback(null, userReviews);
                    })
                }, function callbackFunction(err, result) {
                    if (err) {
                        return res.status(500).send({ message: 'Please wait for some time and try again.', error: err })
                    }
                    console.log("over here")
                    res.status(200).send({ message: "All good", success: userReviews });
                })
            }
        })
    })
}
