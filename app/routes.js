var restos       = require('../app/models/restaurant');
var foodItem = require('../app/models/foodItem');
var reviewSchema = require('../app/models/reviewSchema');
var restoItemSchema = require('../app/models/restoItemSchema');
var users = require('../app/models/user');

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
    
    // normal routes ===============================================================
    
        // show the home page (will also have our login links)
        app.get('/', function(req, res) {
            res.render('index.ejs');
        });
    
        // PROFILE SECTION =========================
        app.get('/profile', isLoggedIn, function(req, res) {
            res.render('profile.ejs', {
                user : req.user
            });
        });
    
        // LOGOUT ==============================
        app.get('/logout', function(req, res) {
            req.logout();
            res.redirect('/');
        });

        // =============================================================================
        // AUTHENTICATE (FIRST LOGIN) ==================================================
        // =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // locally --------------------------------
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    

    // =============================================================================
    // EVERYTHING RELATED TO RESTAURANTS==============================================   
    // =============================================================================



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

    app.post("/addReview", (req, res) => {
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
                        var reviewData = new reviewSchema(req.body);
                        var resto_item_rating_Data = new restoItemSchema();

                        console.log(req.body)

                        //get user_id from user collection
                        restos.find({ 'name': req.body.restaurantName }, (err, restaurant) => {
                            if (err) {
                                console.log("erroe--------", err);
                            } else {
                                console.log("restaurant details", restaurant);
                                resto_item_rating_Data.resto_id = restaurant[0]._id;
                            }
                        });

                        foodItem.findOneAndUpdate({ 'name': req.body.foodItem }, { 'name': req.body.foodItem, 'images': element }, { upsert: true, new: true }, (err, item) => {
                            if (err) {
                                console.log("erroe--------", err);
                            } else {
                                console.log("item details", item);
                                resto_item_rating_Data.item_id = item._id;
                            }
                        });

                        reviewData.imageUrl = element;

                        reviewData.save(function (err, review) {
                            if (err) throw err;
                            else {
                                console.log("review id------", review._id);
                                resto_item_rating_Data.review_id = review._id;
                                console.log("resto_item_rating_Data------", resto_item_rating_Data)
                            }
                        })
                            .then(item => {
                                //res.send("Name saved to database");
                                resto_item_rating_Data.save((err, data) => {
                                    if (err) {
                                        console.log("error in storing resto item data", err);
                                    } else {
                                        console.log("stored data-------", data);
                                    }
                                })
                            })
                            .catch(err => {
                                res.status(400).send("Unable to save to database");
                            });

                        /* users.find({ 'email': req.body.userName }, (err, user) => {
                            if (err) {
                                console.log("Could not get the user with this name", err)
                            } else {
                                console.log("user id", user);
                                //reviewData.user_id = user[0]._id;
                                console.log("reviewData------------", reviewData);
                                reviewData.save(function (err, review) {
                                    if (err) throw err;
                                    else {
                                        console.log("review id------", review._id);
                                        resto_item_rating_Data.review_id = review._id;
                                        console.log("resto_item_rating_Data------", resto_item_rating_Data)
                                    }
                                })
                                    .then(item => {
                                        //res.send("Name saved to database");
                                        resto_item_rating_Data.save((err, data) => {
                                            if (err) {
                                                console.log("error in storing resto item data", err);
                                            } else {
                                                console.log("stored data-------", data);
                                            }
                                        })
                                    })
                                    .catch(err => {
                                        res.status(400).send("Unable to save to database");
                                    });
                            }
                        }); */
                    }).catch(err => {
                        console.log("error---------", err)
                    })
                } else {
                    console.log("inside else--------");
                    console.log("req.body-----------", req.body)
                    var reviewData = new reviewSchema(req.body);
                    var resto_item_rating_Data = new restoItemSchema();

                    console.log(req.body)

                    //get user_id from user collection
                    restos.find({ 'name': req.body.restaurantName }, (err, restaurant) => {
                        if (err) {
                            console.log("erroe--------", err);
                        } else {
                            console.log("restaurant details", restaurant);
                            resto_item_rating_Data.resto_id = restaurant[0]._id;
                        }
                    });

                    foodItem.findOneAndUpdate({ 'name': req.body.foodItem }, { 'name': req.body.foodItem }, { upsert: true, new: true }, (err, item) => {
                        if (err) {
                            console.log("erroe--------", err);
                        } else {
                            console.log("item details", item);
                            resto_item_rating_Data.item_id = item._id;
                        }
                    });

                    reviewData.save(function (err, review) {
                        if (err) throw err;
                        else {
                            console.log("review id------", review._id);
                            resto_item_rating_Data.review_id = review._id;
                            console.log("resto_item_rating_Data------", resto_item_rating_Data)
                        }
                    })
                        .then(item => {
                            //res.send("Name saved to database");
                            resto_item_rating_Data.save((err, data) => {
                                if (err) {
                                    console.log("error in storing resto item data", err);
                                } else {
                                    console.log("stored data-------", data);
                                }
                            })
                        })
                        .catch(err => {
                            res.status(400).send("Unable to save to database");
                        });

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
            // console.log("req inside upload------", req)

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

    app.post("/registerUser", (req,res) => {
        var newUser = new users(req.body);
        newUser.password = newUser.generateHash(req.body.password);
        newUser.save(function (err) {
            if (err) throw err;
        })
            .then(item => {
                res.send("Name saved to database");
            })
            .catch(err => {
                res.status(400).send("Unable to save to database");
            });
    });

    app.post("/signIn", (req, res) => {
        console.log(req.body);
        users.find({email: req.body.email}, function (err, user) {
            console.log(user);
           if(err) {
               res.send(err)
           }
          else if(!user) {
               res.send("No user found")
           }
           else if (!validPassword(req.body.password, user[0].password)){
                res.send("please enter a valid password")
            }
           else {
               const JWTToken = jwt.sign({
                   _id: user._id
                    },
                   'secret',
                   {
                       expiresIn: '2h'
                   });
               res.status(200).json({
                   success: 'Welcome to the JWT Auth',
                   token: JWTToken
               });
           }
        })
    });

  var  validPassword = function (password1, password) {
      //console.log("here------------", password, password1)
        var value = bcrypt.compareSync(password1, password);
        console.log(value);
        return value;
    };

    /* app.get("/getFoodItems", (req, res) => {
        foodItem.find(function (err, users) {
            res.json({ docs: users })
            //res.send(users);
        });
    }); */


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
