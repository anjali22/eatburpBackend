var restos       = require('../app/models/restaurant');
var foodItem = require('../app/models/foodItem');
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
var Promise = require('promise');
//for image upload
var express = require('express');
var app = express();
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}));
 

app.use(fileUpload());
  
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

// our model
var A = mongoose.model('A', schema);
// s3 setup
var AWS = require('aws-sdk');
var dotenv = require('dotenv');
dotenv.config();

const S3_BUCKET = process.env.S3_BUCKET;

AWS.config.update({
    region: 'us-east-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var winston = require('winston');

  var logger = new winston.Logger({
    level: 'error',
    transports: [
      new (winston.transports.File)({ filename: 'error.log' })
    ]
  });


module.exports = function(app, passport) {
    
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
// EVERYTHING RELATED TO FOOD ITEM==============================================   
// =============================================================================

app.get('/addItem', function(req, res){
    console.log("jhihhi");
    res.render('addItem.ejs');
//res.sendFile(__dirname + '/addItem.html');
});

app.post("/addItem", (req, res) => {
var itemsData = new items(req.body);
console.log("itemsData------------", itemsData);
itemsData.save(function(err){
    if (err) throw err;
})
    .then(item => {
        res.send("Name saved to database");
    })
    .catch(err => {
        res.status(400).send("Unable to save to database");
    });
});

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

    //var type = upload.array('photo', 25);

app.post('/uploadrestoimage', function (req, res) {
    console.log("req----------",req.files);
    console.log(req.body);
    var tmp_path;
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
    var tmp_path;
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

app.get('/uploadimage', function (req, res) {
    console.log("jhihhi");
    res.render('uploadImages.ejs');
    //res.sendFile(__dirname + '/addResto.html');
});
var imageUrl = [];

app.post('/uploadimage',  function (req, res) {
    console.log(req.images);
    console.log(req.body);
    var tmp_path;
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

multipleFile = function (req) {
    return new Promise(function (resolve, reject) {
        console.log("req.files---------", req.files)
        async.forEachOf(req.files, function (element, i, callback) {
            var data = element.buffer;
            const fileName = element.originalname;
            const mimeType = element.mimeType;

            const s3Params = {
                Bucket: S3_BUCKET,
                Key: req.body.name + '/' + fileName,
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
