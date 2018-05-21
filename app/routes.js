var restaurantSchema       = require('../app/models/restaurantSchema');
var dishSchema = require('../app/models/dishSchema');
var reviewSchema = require('../app/models/reviewSchema');
var dishRestaurantMappingSchema = require('../app/models/dishRestaurantMappingSchema');
var employee = require('../app/models/employeeSchema');

var bodyParser = require('body-parser');
var Promise = require('promise');
var express = require('express');
const jwt = require('jsonwebtoken');

var app = express();

app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}));
 
  
var fs = require('fs');
var multer  =   require('multer');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// img path
var imgPath = '/home/anjali/Desktop/lassi.jpg';
// example schema
var schema = new Schema({
    img: { data: Buffer, contentType: String }
});

var winston = require('winston');

var logger = new winston.Logger({
    level: 'error',
    transports: [
        new (winston.transports.File)({ filename: 'error.log' })
    ]
});

module.exports = function(app, passport, AWS) {

    app.get('/', function (req, res) {
        console.log("jhihhi");
        res.render('index.ejs');
        //res.sendFile(__dirname + '/addResto.html');
    });

    app.get('/addResto', function(req, res){
        console.log("jhihhi");
        res.render('addResto.ejs');
    //res.sendFile(__dirname + '/addResto.html');
    });

    app.post("/addResto", (req, res) => {
    var restaurantSchemaData = new restaurantSchema(req.body);
    console.log("restosData------------", restaurantSchemaData);
    restaurantSchemaData.save(function(err){
        if (err) throw err;
    })
        .then(item => {
            res.send("Name saved to database");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
    });

    var s3 = new AWS.S3();

    var async = require('async');

    var upload = multer().array('photo', 25);
    const S3_BUCKET = process.env.S3_BUCKET;


        //var type = upload.array('photo', 25);

    app.post('/uploadrestoimage', function (req, res) {
        console.log("req----------",req.files);
        console.log(req.body);
        upload(req, res, function multerUpload(err) {
            //console.log("req inside upload------",req)
            console.log('building', req.body['address.building']);
            var userId;
            var token = req.headers['x-access-token'];
            if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

            jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
                if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
                else {
                    console.log('decoded-----------', decoded);
                    userId = decoded._id
                }
            });
            restaurantSchema.find(
                {
                    $and: [
                        {'restaurant_name': req.body.name},
                        {'address.building': req.body['address.building']}
                    ]
                }, 
                (error) => {
                    if (error) {
                        console.log(error)
                    }
            })
            .then(result => {
                console.log('result------', result)
                if(result.length !== 0) {
                    console.log('already a entry in database---------');
                    res.status(400).json({"message": "Please enter a new restaurant. this one already exsits"})
                    // do nothing
                }
                else{
                    console.log("now insert image along with data");
                    if (req) {
                        multipleFile(req).then(element => {
                            console.log("body-----------", req.body);
                            console.log("element--------", element);
                            req.body.images = element;
                            console.log("req.body-----------", req.body)
                            var restaurantSchemaData = new restaurantSchema(req.body);
                            //console.log("restosData------------", restosData);
                            restaurantSchemaData.save((err, result) => {
                                    if (err) {
                                        console.log("error--------", err);
                                        res.status(400).json({"message": err});
                                    } else {
                                        console.log("item details", result);
                                        //res.status(200).json({ "message": "Successfully saved" });
                                        employee.findOneAndUpdate(
                                            { _id: userId },
                                            {
                                                $push: {
                                                    added_restaurants_id: result._id
                                                }
                                            },
                                            function (err, result) {
                                                if (err) {
                                                    console.log(err);
                                                    res.status(400).json({ "message": err });
                                                } else {
                                                    console.log(result, 'resultsssssssss')
                                                    res.status(200).json({ "message": "Successfully saved" });
                                                }
                                            })
                                    }
                                })
                            //res.send("uploaded successfully")
                        }).catch(err => {
                            console.log("error---------", err)
                            res.status(500).json({"message": "error in saving data please report to technical team" + err})
                        })
                    }  
                }
            })
        })
    });

    app.post('/addDish', function (req, res) {
        console.log("req----------", req.files);
        console.log(req.body);
        upload(req, res, function multerUpload(err) {
            console.log("req inside upload------", req)
            if (err) {
                console.log(err)
            } else {
                if (req.files) {
                    multipleFile(req).then(element => {
                        console.log("body-----------", req.body);
                        console.log("element--------", element);
                        req.body.images = element;
                        console.log("req.body-----------", req.body)
                        var dishSchemaData = new dishSchema(req.body);
                        console.log("Dish------------", dishSchemaData);
                        dishSchemaData.save(function (err) {
                            if (err) throw err;
                        })
                            .then(item => {
                                res.send("Name saved to database");
                            })
                            .catch(err => {
                                res.status(400).send("Unable to save to database");
                            });
                        //res.send("uploaded successfully")
                    }).catch(err => {
                        console.log("error---------", err)
                    })
                } else {
                    console.log("inside else--------")
                }
            }
        })
    });

    app.get("/getMyReviews", (req, res) => {
        var token = req.headers['x-access-token'];
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            else {
                console.log('decoded-----------', decoded);
                user_id = decoded._id
            }
        });
    })

    app.post("/addReview", (req, res, next) => {
        console.log("req----------", req.files);
        console.log(req.body);
        upload(req, res, function multerUpload(err) {
            //console.log("req inside upload------", req)
            if (err) {
                console.log(err)
                res.send("issue with saving");
            } else {
                var user_id;
                console.log('headers---------', req.headers)
                var token = req.headers['x-access-token'];
                if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

                jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
                    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
                    else {
                        console.log('decoded-----------', decoded);
                        user_id = decoded._id
                    }
                });
                var restaurant_id, dish_id, review_id;
               // reviewData.user_id = user_id;
                if (req.files) {
                    multipleFile(req).then(element => {
                        console.log("body-----------", req.body);
                        console.log("element--------", element);
                        req.body.images = element;
                        console.log("req.body-----------", req.body)
                        var reviewData = new reviewSchema(req.body);
                        //var resto_item_rating_Data = new dishRestaurantMappingSchemaSchema();

                        async.parallel([
                            function getRestaurantId(callback) {
                                restaurantSchema.findOneAndUpdate(
                                    { 'name': req.body.restaurantName },
                                    { 'name': req.body.restaurantName },
                                    { upsert: true, new: true },
                                    (err, restaurant) => {
                                        if (err) {
                                            console.log("error--------", err);
                                            callback(err);
                                        }
                                        console.log("restaurant details", restaurant);
                                        restaurant_id = restaurant._id;
                                        callback();
                                    }
                                );
                            },

                            function getDishId(callback) {
                                dishSchema.findOneAndUpdate(
                                    { 'name': req.body.dish },
                                    { 'name': req.body.dish, 'images': element },                                    { upsert: true, new: true },
                                    (err, item) => {
                                        if (err) {
                                            console.log("erroe--------", err);
                                            callback(err);
                                        }
                                        console.log("item details", item);
                                        dish_id = item._id;
                                        callback();
                                    }
                                );
                            },

                            function saveReviewData(callback) {
                                reviewData.user_id = user_id;
                                reviewData.save(function (err, review) {
                                    if (err) {
                                        callback(err);
                                    }
                                    console.log("review id------", review._id);
                                    review_id = review._id;
                                    callback();
                                })
                            }
                        ],
                            function savingReviewToDishRestaurantMappingModel(err, result) {
                                if (err) {
                                    return next(err);
                                }
                                dishRestaurantMappingSchema.findOneAndUpdate(
                                    {
                                        $and: [
                                            { 'restaurant_id': restaurant_id },
                                            { 'dish_id': dish_id }
                                        ]
                                    },
                                    {
                                        'restaurant_id': restaurant_id,
                                        'dish_id': dish_id,
                                        $push: {
                                            review_id: review_id
                                        }
                                    },
                                    {
                                        upsert: true,
                                        new: true
                                    },
                                    function (err, result) {
                                        if (err) {
                                            console.log("error in storing resto item data", err);
                                        } else {
                                            console.log("stored data-------", result);
                                            res.status(200).json({
                                                success: "review saved to database."
                                            })
                                        }
                                    }
                                )
                            }
                        );
                    }).catch(err => {
                        console.log("error---------", err)
                    })
                } else {
                    console.log("inside else--------");
                    console.log("req.body-----------", req.body)
                    var reviewData = new reviewSchema(req.body);
                    //var resto_item_rating_Data = new dishRestaurantMappingSchemaSchema();

                    async.parallel([
                        function getRestaurantId(callback) {
                            restaurantSchema.findOneAndUpdate(
                                { 'name': req.body.restaurantName },
                                { 'name': req.body.restaurantName },
                                { upsert: true, new: true },
                                (err, restaurant) => {
                                    if (err) {
                                        console.log("error--------", err);
                                        callback(err);
                                    } 
                                    console.log("restaurant details", restaurant);
                                    restaurant_id = restaurant._id;
                                    callback();
                                }
                            );
                        },

                        function getDishId(callback) {
                            dishSchema.findOneAndUpdate(
                                { 'name': req.body.dish },
                                { 'name': req.body.dish },
                                { upsert: true, new: true },
                                (err, item) => {
                                    if (err) {
                                        console.log("erroe--------", err);
                                        callback(err);
                                    } 
                                    console.log("item details", item);
                                    dish_id = item._id;
                                    callback();
                                }
                            );
                        },

                        function saveReviewData(callback) {
                            reviewData.user_id = user_id;
                            reviewData.save(function (err, review) {
                                if (err) {
                                    callback(err);
                                } 
                                console.log("review id------", review._id);
                                review_id = review._id;
                                callback();
                            })
                        }
                    ], 
                        function savingReviewToDishRestaurantMappingModel(err, result) {
                            if(err) {
                                return next(err);
                            }
                            dishRestaurantMappingSchema.findOneAndUpdate(
                                {
                                    $and: [
                                        { 'restaurant_id': restaurant_id },
                                        { 'dish_id': dish_id }
                                    ]
                                },
                                {
                                    $push: {
                                        review_id: review_id
                                    }
                                },
                                {
                                    upsert: true,
                                    new: true
                                },
                                function (err, result) {
                                    if (err) {
                                        console.log("error in storing resto item data", err);
                                    } else {
                                        console.log("stored data-------", result);
                                        res.status(200).json({
                                            success: "review saved to database."
                                        })
                                    }
                                }
                            )
                        }
                    )
                }
            }
        }) 
    });


    app.get('/uploadimage', function (req, res) {
        console.log("jhihhi");
        res.render('uploadImages.ejs');
        //res.sendFile(__dirname + '/addResto.html');
    });

        var imageUrl = [];


    app.post('/uploadimage',  function (req, res) {
        console.log(req.images);
        console.log(req.body);
        upload(req, res, function multerUpload(err) {
            if (err) {
                console.log(err)
            } else {
                multipleFile(req)
                    .then(element => {
                        console.log("body-----------", req.body);
                        console.log("element--------", element);
                        res.send("uploaded successfully")
                    })
                    .catch(err => {
                        console.log("error---------", err)
                    })
                }
        })

    });

    app.get("/getRestaurants", (req, res) => {
        restaurantSchema.find(function (err, resto) {
            res.json({ docs: resto })
        });
    });


    app.get("/getDishes", (req, res) => {
        dishSchema.find(function (err, users) {
            res.json({ docs: users })
            //res.send(users);
        });
    });


    multipleFile = function (req) {
        return new Promise(function (resolve, reject) {
            console.log("req.files---------", req.files)
            async.forEachOf(req.files, function (element, i, callback) {
                var data = element.buffer;
                const fileName = element.originalname;
                const mimeType = element.mimeType;

                const s3Params = {
                    Bucket: S3_BUCKET,
                    Key: req.body.restaurant_name || req.body.dish_name + '/' + fileName,
                    Expires: 60,
                    Body: data,
                    ContentType: mimeType,
                    ACL: 'public-read'
                };

                s3.upload(s3Params, function (error, data) {
                    if (error) {
                        winston.log("Error uploading data: ", error);
                        console.log("Error uploading data: ", error);
                        const returnData = {
                            signedRequest: data,
                            url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
                        };
                        res.write(JSON.stringify(returnData));
                        reject(error);
                    } else {
                        console.log("response--------------", data);
                        winston.log("Successfully uploaded data to myBucket/myKey");
                        console.log("Successfully uploaded data to myBucket/myKey");
                        imageUrl[i] = data.Location;
                        console.log(imageUrl, "imageUrl------")
                        //res.send("Image saved to database");
                    }
                    callback();
                });            
            }, function (err) {
                if (err){
                    reject(err)
                }
                else{
                    console.log("inside callback--------")
                    resolve(imageUrl);
                }
            });
        });
    } 

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
            var searchTag= [];
            if(inputField.search_tag.includes(',')) {
                const allValues = inputField.search_tag.split(',');
                for (let i = 0; i < allValues.length; i++) {
                    searchTag.push(allValues[i]);
                }
            }
            else {
                searchTag.push(inputField.search_tag);
            }
            /** Check whether that food item is already stored or not in food item collection. 
             * Only if not then store new one otherwise pick the id already stored */
            dishSchema.findOneAndUpdate(
                { 'dish_name': inputField.dish_name },
                {
                    'dish_name': inputField.dish_name,
                    'cuisine': inputField.cuisine,
                    'meal': inputField.meal,
                    'search_tag': searchTag,
                    'type': inputField.type
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
                            $and: [
                                {'restaurant_id': req.body.restoName},
                                {'dish_id': item._id}
                            ]
                        },
                        {
                            'restaurant_id': req.body.restoName,
                            'dish_id': item._id,
                            'price': inputField.price,
                            'dish_category': inputField.menu_category
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
                                    {_id: userId},
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

    app.get("/searchRestoName", (req, res) => {
        console.log("searching");
        restaurantSchema.find({}, { restaurant_name: 1 },
            function (err, resto) {
                if (err) return console.error(err);
                res.send(JSON.stringify({ "results": resto }));
            }
        );
    });

    app.get("/getMenu", (req, res) => {
        console.log('query params', req.query);
        dishRestaurantMappingSchema.find({ restaurant_id: req.query.rid}, function (err, menu) {
            if (err) throw err;
            console.log('menu------------', menu);
            var restoDish = [];
            async.forEachOf(menu, function (item, index, callback) {
                dishSchema.findOne({_id: item.dish_id}, function (error, dish) {
                    console.log('dish name', dish);
                    restoDish[index] = {
                        dish_id: item.dish_id,
                        dish_name: dish.dish_name,
                        dish_price: item.price,
                        dish_category: item.dish_category
                                        }
                    callback();
                })
            }, function (params) {
                res.send(restoDish);
            })           
        })
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

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.redirect('/');
    }
}
