// var restaurantSchema = require('../../app/models/restaurantSchema');
var dishSchema = require('../../app/models/dishSchema');
var reviewSchema = require('../../app/models/reviewSchema');
var dishRestaurantMappingSchema = require('../../app/models/dishRestaurantMappingSchema');
var employee = require('../../app/models/employeeSchema');
var userSchema = require('../models/user');

var bodyParser = require('body-parser');
var express = require('express');
const jwt = require('jsonwebtoken');
var app = express();
var async = require('async');

app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}));

module.exports = function dishRestaurantMappingAPI(app) {
    app.post("/addMenu", (req, res) => {
        console.log(req.body);
        var userId;
        console.log('headers---------', req.headers)
        var token = req.headers['x-access-token'];
        console.log('token-----------', token);
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            else {
                console.log('decoded-----------', decoded);
                userId = decoded._id
            }
        });
        async.forEachOf(req.body.inputFields, function (inputField, index, callback) {
            var searchTag = [];
            inputField.search_tag.forEach(x => {
                searchTag.push(x['search_tag']);
            });
            console.log('search tags------------', searchTag);
            // Check whether that food item is already stored or not in food item collection. 
            // * Only if not then store new one otherwise pick the id already stored 
            dishSchema.findOneAndUpdate(
                { 'dish_name': inputField.dish_name },
                {
                    'dish_name': inputField.dish_name,
                    'cuisine': inputField.cuisine,
                    'meal': inputField.meal,
                    'search_tag': searchTag,
                    'type': inputField.type,
                    'images': []
                },
                {
                    upsert: true,
                    new: true
                }
            )
                .then(item => {
                    console.log('item-------', item)
                    dishRestaurantMappingSchema.findOneAndUpdate(
                        {
                            'restaurant_id': req.body.restaurant._id,
                            'dish_id': item._id 
                        },
                        {
                            'restaurant_id': req.body.restaurant._id,
                            'restaurant_name': req.body.restaurant.restaurant_name,
                            'dish_id': item._id,
                            'dish_name': item.dish_name,
                            'price': inputField.price,
                            'dish_category': inputField.menu_category,
                            'search_tag': searchTag,
                            'review_id': [],
                            'average_rating': 0,
                            'images': [],
                            'recommended':0
                        },
                        {
                            upsert: true,
                            new: true
                        },
                        function (err, result) {
                            if (err) {
                                console.log(err);
                                callback(err);
                            } else {
                                console.log('result', result)
                                //res.status(200).json({ "message": "saved to database" }) 
                                //callback(null, result);
                                employee.findOneAndUpdate(
                                    { _id: userId },
                                    {
                                        $push: {
                                            added_menu_id: result._id
                                        }
                                    },
                                    function (err, result) {
                                        if (err) {
                                            console.log(err);
                                            callback(err);
                                        } else {
                                            console.log(result, 'resultsssssssss')
                                            callback(null, result);
                                        }
                                    })
                            }
                        }
                    )
                })
                .catch(err => {
                    callback(err);
                })
        }, function (err, result) {
            if (err) {
                res.status(500).json({ "message": "Could not save" + err });
            }
            else {
                console.log('final result-------', result);
                res.status(200).json({ "message": "saved to database" })
            }
        })

        //res.send("added");
    });

    app.get("/test", (req, res) => {
        //const query = new mongoose.Query();
        const query = dishRestaurantMappingSchema.find();
        query.setOptions({ explain: 'queryPlanner'});
        query.collection(dishRestaurantMappingSchema.collection);
        query.where('restaurant_id', '5af6ae1cf36d280cecd2038c').exec(function name(params, result) {
            console.log(result);
            res.send(result)
        })
    });

    app.get("/getMenu", (req, res) => {
        console.log(req.query)
        var userId;
        console.log('headers---------', req.headers)
        var token = req.headers['x-access-token'];
        console.log('token-----------', token);
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            else {
                console.log('decoded-----------', decoded);
                userId = decoded._id
            }
        });

        dishRestaurantMappingSchema.find( {"restaurant_id": req.query.rid}, function name(err, menu) {
            if(err) {
                res.status(500).send({message: 'Please wait for some time and try again.',error: err })
            } else {
                res.status(200).send({message: "menu recevied", success: menu});
            }
        })
    });

  

    app.get("/getTopDishes", (req, res) => {
        var userId;
        console.log('headers---------', req.headers)
        var token = req.headers['x-access-token'];
        console.log('token-----------', token);
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            else {
                console.log('decoded-----------', decoded);
                userId = decoded._id
            }
        });
        dishRestaurantMappingSchema.find({}, {}, {sort: {average_rating: -1}, limit: 10}, function name(err, topDishes) {
            if(err) {
                res.status(500).send({ message: 'Please wait for some time and try again.', error: err })
            } else {
                res.status(200).send({message: "Here are top 10 dishes", success: topDishes});
            }
        })
      
    });

    app.get("/getMenuData", (req, res) => {
        dishRestaurantMappingSchema.find(function (err, resto) {
            res.json({ docs: resto })
        });
    })

    app.get("/getTopDishRestaurants", (req, res) => {
        console.log("query param", req.query.tag);
        tag = req.query.tag;;
        //find those dishes which have searchtag we got above
        dishSchema.find({ search_tag: tag }, function (err, dishes) {
            if (err) throw err;
            var topRestaurants = [];
            console.log('dishes-------', dishes);
            async.forEachOf(dishes, function (dish, index, callback) {
                dishRestaurantMappingSchema.find({ dish_id: dish._id }, function (error, mapping) {
                    mapping[0].dish_name = 'Test Dish';
                    mapping[0].restaurant_name = 'Test restaurant';
                    topRestaurants.push(mapping[0]);
                    console.log("mappinggggggggggggggggggg", mapping[0]);
                    callback();
                })
            }, function (err) {
                if (err) {
                    console.log(err);
                }
                console.log('top restaurantssssss', topRestaurants);
                topRestaurants.sort(function (a, b) {
                    console.log('ave rating', a.average_rating, b.average_rating);
                    return b.average_rating - a.average_rating;
                });
                console.log('top restaurantssssss after sorting-------', topRestaurants);
                console.log(topRestaurants.slice(0, 10));
                res.send(topRestaurants);
            })
        })
    });

    app.post("/addRecommendedDish", (req, res) => {
        console.log("req.body", req.body);
        var userId, review_id;
        console.log('headers---------', req.headers)
        var token = req.headers['x-access-token'];
        console.log('token-----------', token);
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            else {
                console.log('decoded-----------', decoded);
                userId = decoded._id
            }
        });
        var reviewData = new reviewSchema();
        reviewData.rating = 5;
        reviewData.recommended = true;
        //reviewData.user_id = req.body.userId;
        reviewData.review = '';
        reviewData.date = '';
        reviewData.images = [];
        reviewData.user_id = userId; 
        async.series([
            function saveReview(callback) {
                reviewData.save(function (err, review) {
                    if (err) {
                        console.log(err);
                    }
                    console.log("review id------", review._id);
                    review_id = review._id;
                    callback();
                })
            },

            function addRecommendValueInDishRestoMapping(callback) {
                dishRestaurantMappingSchema.findOneAndUpdate(
                    {
                       _id: req.body.mappingId
                    },
                    {
                        $push: {
                            review_id: review_id
                        },
                        $inc: { 
                            recommended: 1 
                        } 
                    },
                    {
                        upsert: true,
                        new: true
                    },
                    function (err, result) {
                        if (err) {
                            console.log("error in storing resto item data 1-------", err);
                            callback();
                        } else {
                            console.log("stored data------- 1", result);
                            callback(result);
                        }
                    }
                )
            }
        ],
        function increaseCountOfUserReview(err, results) {
            if (err) throw err;
            userSchema.findOneAndUpdate(
                {
                    _id: userId
                },
                {
                    $inc: {
                        no_of_recommendations: 1,
                        no_of_reviews: 1
                    }
                },
                {
                    upsert: true,
                    new: true
                },
                function (err, result) {
                    if (err) {
                        console.log("error in storing resto item data 2--------", err);
                        //callback(err);
                    } else {
                        console.log("stored data------- 2", results);
                        //callback(result);
                        res.send(results)
                    }
                }
            )
        })    
    })
}
