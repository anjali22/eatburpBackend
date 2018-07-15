// var restaurantSchema = require('../../app/models/restaurantSchema');
var dishSchema = require('../../app/models/dishSchema');
var reviewSchema = require('../../app/models/reviewSchema');
var dishRestaurantMappingSchema = require('../../app/models/dishRestaurantMappingSchema');
var employee = require('../../app/models/employeeSchema');
var userSchema = require('../models/user');
var searchTag = require('../models/searchTagSchema');

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
        async.forEach(req.body.inputFields, function forOneObject(inputField, callback) {
            async.series([
                function insertSearchTags(callback) {
                    for(var i = 0; i<inputField.search_tag.length; i++) {
                        searchTag.findOneAndUpdate(
                            { 'search_tag': inputField.search_tag[i] },
                            { $setOnInsert: { 'search_tag': inputField.search_tag[i] } },
                            {
                                upsert: true,
                                new: true
                            }, 
                             function (err, result) {
                                if (err) throw err;
                                console.log("search tag inserted");
                             }
                        )
                    }
                    callback();
                },
                function insertDish(callback) {
                    dishSchema.findOneAndUpdate(
                        {
                            "dish_name": inputField.dish_name
                        },
                        {
                            $setOnInsert: {
                                "dish_name": inputField.dish_name,
                                "cuisine": inputField.cuisine,
                                "meal": inputField.meal,
                                "type": inputField.meal,
                                "search_tag": inputField.search_tag,
                                "images": []
                            }
                        },
                        {
                            upsert: true,
                            new: true
                        }, 
                        function (err, result) {
                            if(err) {
                                callback(err);
                            } else{
                                callback(null, result)
                            }
                        }
                    )
                }
            ], function insertIntoMenu(err, results) {
                console.log("results----------",results)
                dishRestaurantMappingSchema.findOneAndUpdate(
                    {
                        "restaurant_id": inputField.restaurant_id,
                        "dish_name": inputField.dish_name
                    },
                    {
                        $setOnInsert: {
                            "restaurant_id": inputField.restaurant_id,
                            "dish_name": inputField.dish_name,
                            "restaurant_name": inputField.restaurant_name,
                            "dish_id": results[1]._id,
                            "price": inputField.price,
                            "search_tag": inputField.search_tag,
                            "dish_category": inputField.dish_category,
                            "review_id": [],
                            "average_rating": 0,
                            "images": [],
                            "recommended": 0,
                            "reviews": []
                        }
                    },
                    {
                        upsert: true,
                        new: true
                    },
                    function (err, result) {
                        if(err) {
                            console.log(err);
                            
                        } else {
                            console.log(result);
                        }
                        callback(null, results);
                    }
                )
            }
        )
        }, function finalCallback(err, result) {
            if(err) throw error;
            console.log("final callback", result)
            res.send("all good");
        }
    )
    })

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
        reviewData.images = [];
        reviewData.user_id = userId; 
        async.series([
            function saveReview(callback) {
                reviewData.save(function (err, review) {
                    if (err) {
                        console.log(err);
                        callback(err);
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
                            callback(err);
                        } else {
                            console.log("stored data------- 1", result);
                            callback(null, result);
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
                function (err, result) {
                    if (err) {
                        console.log("error in storing resto item data 2--------", err);
                        //callback(err);
                    } else {
                        console.log("stored data------- 2", result);
                        //callback(result);
                        res.status(200).send({message: "successful", success: results[1]})
                        //res.send(results[1]);
                    }
                }
            )
        })    
    })
}
