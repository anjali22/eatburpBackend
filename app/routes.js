var restaurantSchema = require('../app/models/restaurantSchema');
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
var multer = require('multer');

var winston = require('winston');

var logger = new winston.Logger({
    level: 'error',
    transports: [
        new (winston.transports.File)({ filename: 'error.log' })
    ]
});

module.exports = function (app, AWS) {

    app.get('/', function (req, res) {
        console.log("jhihhi");
        res.render('index.ejs');
        //res.sendFile(__dirname + '/addResto.html');
    });

    app.get('/addResto', function (req, res) {
        console.log("jhihhi");
        res.render('addResto.ejs');
        //res.sendFile(__dirname + '/addResto.html');
    });

    app.post("/addResto", (req, res) => {
        var restaurantSchemaData = new restaurantSchema(req.body);
        console.log("restosData------------", restaurantSchemaData);
        restaurantSchemaData.save(function (err) {
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
        console.log("req----------", req.files);
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
                        { 'restaurant_name': req.body.name },
                        { 'address.building': req.body['address.building'] }
                    ]
                },
                (error) => {
                    if (error) {
                        console.log(error)
                    }
                })
                .then(result => {
                    console.log('result------', result)
                    if (result.length !== 0) {
                        console.log('already a entry in database---------');
                        res.status(400).json({ "message": "Please enter a new restaurant. this one already exsits" })
                        // do nothing
                    }
                    else {
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
                                        res.status(400).json({ "message": err });
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
                                            }
                                        )
                                    }
                                })
                                //res.send("uploaded successfully")
                            }).catch(err => {
                                console.log("error---------", err)
                                res.status(500).json({ "message": "error in saving data please report to technical team" + err })
                            })
                        } else {
                            console.log("inside else--------")
                            restaurantSchemaData.save((err, result) => {
                                if (err) {
                                    console.log("error--------", err);
                                    res.status(400).json({ "message": err });
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
                                        }
                                    )
                                }
                            })
                        }
                    }
                }
            )
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
                if (req.files) {
                    multipleFile(req)
                    .then(element => {
                        console.log("body-----------", req.body);
                        console.log("element--------", element);
                        req.body.images = element;
                        console.log("req.body-----------", req.body)
                        var reviewData = new reviewSchema(req.body);
                        reviewData.user.user_id = req.body.user_id;
                        reviewData.save()
                        .then(review => {
                            console.log("review added", review);
                            dishRestaurantMappingSchema.findOneAndUpdate(
                                {
                                    "restaurant_id": req.body.restaurant_id,
                                    "_id": req.body.mapping_id
                                },
                                {
                                    $push: {
                                        review_id: review._id,
                                        reviews: { $each: [review], $sort: { date: -1 }, $slice: 3 }
                                    }
                                }
                            )
                                .then(item => {
                                    console.log("item found", item);
                                    res.status(200).send({ "message": "Here are the reviews", success: item });
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(400).send({ "message": "Please try in some time", error: err })
                                });
                        })
                        .catch(err => {
                            console.log("error---------", err);
                            res.status(400).send({ "message": "Please try in some time", error: err })
                        });
                    }).catch(err => {
                        console.log("error---------", err);
                        res.status(400).send({ "message": "Please try in some time", error: err })
                    })
                } else {
                    console.log("inside else--------");
                    console.log("req.body-----------", req.body)
                    var reviewData = new reviewSchema(req.body);
                    reviewData.user.user_id = user_id;
                    reviewData.save(function (err) {
                        if(err) {
                            res.status(400).send({"message": "Please try in some time", error: err})
                        }
                    })
                    .then(review => {
                        console.log("review added",review);
                        dishRestaurantMappingSchema.findOneAndUpdate(
                            {
                                "restaurant_id": req.body.restaurant_id, 
                                "_id": req.body.mapping_id
                            },
                            {
                                $push: {
                                    review_id: review._id,
                                    reviews: { $each: [review], $sort:{date: -1}, $slice: 3 } 
                                }
                            }
                        )
                        .then(item => {
                            console.log("item found",item);
                            res.status(200).send({ "message": "Here are the reviews", success: item });
                        })
                        .catch(err=> {
                            console.log(err);
                            res.status(400).send({ "message": "Please try in some time", error: err })
                        });
                    })
                    .catch(err => {
                        console.log("error---------",err);
                        res.status(400).send({ "message": "Please try in some time", error: err })
                    });
                }
            }
        })
    });

    app.get('/findReviews', function (req, res) {
        dishRestaurantMappingSchema.find({ _id: "5af6fd3ece31f73679fce2c3"})
                                   .populate('review_id')
                                    .exec(function (err, story) {
                                        if (err) return handleError(err);
                                        console.log(story);
                                        res.send(story);
                                        // prints "The author is Ian Fleming"
                                    });
    })


    app.get('/uploadimage', function (req, res) {
        console.log("jhihhi");
        res.render('uploadImages.ejs');
        //res.sendFile(__dirname + '/addResto.html');
    });

    var imageUrl = [];


    app.post('/uploadimage', function (req, res) {
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
                if (err) {
                    reject(err)
                }
                else {
                    console.log("inside callback--------")
                    resolve(imageUrl);
                }
            });
        });
    }

    app.get("/searchRestoName", (req, res) => {
        console.log("searching");
        restaurantSchema.find({}, { restaurant_name: 1 },
            function (err, resto) {
                if (err) return console.error(err);
                res.send(JSON.stringify({ "results": resto }));
            }
        );
    });

    app.get("/getRestaurants", (req, res) => {
        restaurantSchema.find(function (err, resto) {
            res.json({ docs: resto })
        });
    });

    app.get("/getReviews", (req, res) => {
        reviewSchema.find(function (err, resto) {
            res.json({ docs: resto })
        });
    });


    app.get("/getDishes", (req, res) => {
        dishSchema.find(function (err, users) {
            res.json({ docs: users })
        });
    });
}
