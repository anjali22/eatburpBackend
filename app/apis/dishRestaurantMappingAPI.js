// var restaurantSchema = require('../../app/models/restaurantSchema');
var dishSchema = require('../../app/models/dishSchema');
var reviewSchema = require('../../app/models/reviewSchema');
var dishRestaurantMappingSchema = require('../../app/models/dishRestaurantMappingSchema');
var employee = require('../../app/models/employeeSchema');
var userSchema = require('../models/users');
var searchTag = require('../models/searchTagSchema');
var restaurantSchema = require('../models/restaurantSchema');

var ObjectId = require('mongoose').Types.ObjectId;
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
    //For Angular app
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
                                "type": inputField.type,
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
                            "locality": inputField.locality,
                            "dish_name": inputField.dish_name,
                            "restaurant_name": inputField.restaurant_name,
                            "dish_id": results[1]._id,
                            "meal": results[1].meal,
                            "cuisine": results[1].cuisine,
                            "price": inputField.price,
                            "search_tag": inputField.search_tag,
                            "dish_category": inputField.category,
                            "review_id": [],
                            "average_rating": 0,
                            "images": [],
                            "recommended": 0,
                            "reviews": [],
                            "review_counts": 0,
                            "experimental_dish": false
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

    //For postman purpose
    app.get("/getMenuData", (req, res) => {
        dishRestaurantMappingSchema.find(function (err, results) {
            if (err) {
                res.status(500).send({ message: 'Please wait for some time and try again.', error: err })
            } else {
                res.status(200).send({ message: "Here are top 10 dishes", success: results });
            }        
        });
    })

    app.post("/addRecommendedDish", (req, res) => {
        console.log("req.body", req.body);
        var userId, review_id, review_rating, average_rating;
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
        reviewData.user.user_id = new ObjectId(userId) ; 
        async.series([
            function saveReview(callback) {
                reviewData.save(function (err, review) {
                    if (err) {
                        console.log(err);
                        callback(err);
                    }
                    console.log("review id------", review._id);
                    review_id = review._id;
                    review_rating = review.rating;
                    callback();
                })
            },

            function addRecommendValueInDishRestoMapping(callback) {
                dishRestaurantMappingSchema.findOneAndUpdate(
                    {
                       _id: req.body.mappingId
                    },
                    {
                        review_id: {
                            id: review_id,
                            rating: review_rating
                        },
                        $inc: { 
                            recommended: 1,
                            review_counts: 1
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
            },

            function calculateAverage(callback) {
                // To calculate average rating using aggregate of mongo
                dishRestaurantMappingSchema.aggregate([
                    {
                        $match: {
                            _id: ObjectId(req.body.mappingId)
                        }
                    },
                    {
                        $project: {
                            average_rating: { $avg: "$review_id.rating" }
                        }
                    }

                ], function (err, result) {
                    if (err) {
                        console.log("error in storing average rating-------", err);
                        callback(err);
                    } else {
                        console.log("average rating----------", result);
                        average_rating = result[0].average_rating;
                        callback(null, result);
                    }
                })
            },

            function saveAverageRating(callback) {
                // To calculate average rating using aggregate of mongo
                dishRestaurantMappingSchema.findOneAndUpdate(
                    {
                        //"restaurant_id": req.body.restaurant_id,
                        _id: req.body.mappingId
                    },
                    {
                        average_rating: average_rating
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
                            console.log("stored data average rating", result);
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
                        res.status(400).send({ message: "Please try in some time", error: err })
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

    app.post("/addRecommendedRestaurant", (req, res) => {
        console.log("req.body", req.body);
        var userId, review_id, review_rating, average_rating;
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
        reviewData.user.user_id = new ObjectId(userId);
        async.series([
            function saveReview(callback) {
                reviewData.save(function (err, review) {
                    if (err) {
                        console.log(err);
                        callback(err);
                    }
                    console.log("review id------", review._id);
                    review_id = review._id;
                    review_rating = review.rating;
                    callback();
                })
            },

            function addRecommendValueInDishRestoMapping(callback) {
                restaurantSchema.findOneAndUpdate(
                    {
                        _id: req.body.restaurant_id
                    },
                    {
                        $push: {
                            review_id: {
                                id: review_id,
                                rating: review_rating
                            }
                        },
                        $inc: {
                            recommended: 1,
                            review_counts: 1
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
            },

            function calculateAverage(callback) {
                // To calculate average rating using aggregate of mongo
                restaurantSchema.aggregate([
                    {
                        $match: {
                            _id: ObjectId(req.body.restaurant_id)
                        }
                    },
                    {
                        $project: {
                            average_rating: { $avg: "$review_id.rating" }
                        }
                    }

                ], function (err, result) {
                    if (err) {
                        console.log("error in storing average rating-------", err);
                        callback(err);
                    } else {
                        console.log("average rating----------", result);
                        average_rating = result[0].average_rating;
                        callback(null, result);
                    }
                })
            },

            function saveAverageRating(callback) {
                // To calculate average rating using aggregate of mongo
                restaurantSchema.findOneAndUpdate(
                    {
                        //"restaurant_id": req.body.restaurant_id,
                        _id: req.body.restaurant_id
                    },
                    {
                        average_rating: average_rating
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
                            console.log("stored data average rating", result);
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
                            res.status(400).send({ message: "Please try in some time", error: err })
                            //callback(err);
                        } else {
                            console.log("stored data------- 2", result);
                            //callback(result);
                            res.status(200).send({ message: "successful", success: results[1] })
                            //res.send(results[1]);
                        }
                    }
                )
            })
    })
}
