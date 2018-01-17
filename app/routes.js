var restos       = require('../app/models/restaurant');

//for image upload
var express = require('express');
var fs = require('fs');
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

var AWS = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
AWS.config.region = 'us-east-2';
// var accessKeyId =  process.env.AWS_ACCESS_KEY || "xxxxxx";
// var secretAccessKey = process.env.AWS_SECRET_KEY || "+xxxxxx+B+xxxxxxx";

// AWS.config.update({
//     accessKeyId: accessKeyId,
//     secretAccessKey: secretAccessKey
// });

// var s3 = new AWS.S3();

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


app.get('/uploadimage', function(req, res){
    console.log("jhihhi");
    res.render('uploadImages.ejs');
//res.sendFile(__dirname + '/addResto.html');
});

const s3 = new AWS.S3();

app.post('/uploadimage', function (req, res) {

 
   
    console.log(req,"upload imageeeeeee");
    winston.log(req,"upload imageeeeeee");

    const fileName = req.body['file-name'];
    console.log(fileName,"upload imageeeeeee");
    winston.log(req.body);
    winston.log(req.params);
    winston.log(fileName,"upload imageeeeeee");

    const fileType = req.query['file-type'];
    console.log(fileType,"upload imageeeeeee");
    winston.log(fileType,"upload imageeeeeee");


    const s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
      };
  
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
      if(err){
        console.log(err);
        return res.end();
      }
      const returnData = {
        signedRequest: data,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
      };
      res.write(JSON.stringify(returnData));
      res.end();
    });
//      // store an img in binary in mongo
//      var a = new A;
//      a.img.data = fs.readFileSync(imgPath);
//      a.img.contentType = 'image/png';
//      a.save(function (err, a) {
//        if (err) throw err;
 
//     console.error('saved img to mongo');
// }).then(item => {
//     res.send("image saved to database");
// })
// .catch(err => {
//     res.status(400).send("Unable to save image to database");
// });

});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
}
