var restos       = require('../app/models/restaurant');
var foodItem = require('../app/models/foodItem');
var reviewSchema = require('../app/models/reviewSchema');
var restoItemSchema = require('../app/models/restoItemSchema');

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

    app.get('/addResto', function(req, res){
        console.log("jhihhi");
        res.render('addResto.ejs');
    //res.sendFile(__dirname + '/addResto.html');
    });

    app.post("/addResto", (req, res) => {
    var restosData = new restos(req.body);
    console.log("restosData------------", restosData);
    restosData.save(function(err){
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
            console.log("req inside upload------",req)
            if(err) {
                console.log(err)
            } else{
                if(req) {
                    multipleFile(req).then(element => {
                        console.log("body-----------", req.body);
                        console.log("element--------", element);
                        req.body.images = element;
                        console.log("req.body-----------", req.body)
                        var restosData = new restos(req.body);
                        console.log("restosData------------", restosData);
                        restosData.save(function (err) {
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
                }  
            }
        })
    });

    app.post('/addfooditem', function (req, res) {
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
                        var foodItemData = new foodItem(req.body);
                        console.log("foodItem------------", foodItemData);
                        foodItemData.save(function (err) {
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
                var resto_id, item_id, review_id;
               // reviewData.user_id = user_id;
                if (req.files) {
                    multipleFile(req).then(element => {
                        console.log("body-----------", req.body);
                        console.log("element--------", element);
                        req.body.images = element;
                        console.log("req.body-----------", req.body)
                        var reviewData = new reviewSchema(req.body);
                        var resto_item_rating_Data = new restoItemSchema();

                        async.parallel([
                            function getRestaurantId(callback) {
                                restos.findOneAndUpdate(
                                    { 'name': req.body.restaurantName },
                                    { 'name': req.body.restaurantName },
                                    { upsert: true, new: true },
                                    (err, restaurant) => {
                                        if (err) {
                                            console.log("error--------", err);
                                            callback(err);
                                        }
                                        console.log("restaurant details", restaurant);
                                        resto_id = restaurant._id;
                                        callback();
                                    }
                                );
                            },

                            function getFoodItemId(callback) {
                                foodItem.findOneAndUpdate(
                                    { 'name': req.body.foodItem },
                                    { 'name': req.body.foodItem, 'images': element },                                    { upsert: true, new: true },
                                    (err, item) => {
                                        if (err) {
                                            console.log("erroe--------", err);
                                            callback(err);
                                        }
                                        console.log("item details", item);
                                        item_id = item._id;
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
                            function savingReviewToRestoItemModel(err, result) {
                                if (err) {
                                    return next(err);
                                }
                                restoItemSchema.findOneAndUpdate(
                                    {
                                        $and: [
                                            { 'resto_id': resto_id },
                                            { 'item_id': item_id }
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
                        );
                    }).catch(err => {
                        console.log("error---------", err)
                    })
                } else {
                    console.log("inside else--------");
                    console.log("req.body-----------", req.body)
                    var reviewData = new reviewSchema(req.body);
                    //var resto_item_rating_Data = new restoItemSchema();

                    async.parallel([
                        function getRestaurantId(callback) {
                            restos.findOneAndUpdate(
                                { 'name': req.body.restaurantName },
                                { 'name': req.body.restaurantName },
                                { upsert: true, new: true },
                                (err, restaurant) => {
                                    if (err) {
                                        console.log("error--------", err);
                                        callback(err);
                                    } 
                                    console.log("restaurant details", restaurant);
                                    resto_id = restaurant._id;
                                    callback();
                                }
                            );
                        },

                        function getFoodItemId(callback) {
                            foodItem.findOneAndUpdate(
                                { 'name': req.body.foodItem },
                                { 'name': req.body.foodItem },
                                { upsert: true, new: true },
                                (err, item) => {
                                    if (err) {
                                        console.log("erroe--------", err);
                                        callback(err);
                                    } 
                                    console.log("item details", item);
                                    item_id = item._id;
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
                        function savingReviewToRestoItemModel(err, result) {
                            if(err) {
                                return next(err);
                            }
                            restoItemSchema.findOneAndUpdate(
                                {
                                    $and: [
                                        { 'resto_id': resto_id },
                                        { 'item_id': item_id }
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
        restos.find(function (err, resto) {
            res.json({ docs: resto })
        });
    });


    app.get("/getFoodItems", (req, res) => {
        foodItem.find(function (err, users) {
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
                    Key: req.body.name || req.body.foodItem + '/' + fileName,
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

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();

        res.redirect('/');
    }
}
