var foodItem = require('../app/models/foodItem');
var bodyParser = require('body-parser');
var Promise = require('promise');
var express = require('express');
var app = express();

app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}));


var fs = require('fs');
var multer = require('multer');

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


module.exports = function foodItemAPIs(app) {
    require('./s3ImageSaving')();
    //console.log('this is-----------', typeof(multipleFile.upload));
    app.get('/uploadimage', function (req, res) {
        console.log("jhihhi");
        res.render('uploadImages.ejs');
        //res.sendFile(__dirname + '/addResto.html');
    });

    app.get("/getFoodItems", (req, res) => {
        foodItem.find(function (err, items) {
            res.json({ docs: items })
            //res.send(users);
        });
    });

    app.get('/addItem', function (req, res) {
        console.log("jhihhi");
        res.render('addItem.ejs');
        //res.sendFile(__dirname + '/addItem.html');
    });

    app.post("/addItem", (req, res) => {
        var itemsData = new foodItem(req.body);
        console.log("itemsData------------", itemsData);
        itemsData.save(function (err) {
            if (err) throw err;
        })
            .then(item => {
                res.send("Name saved to database");
            })
            .catch(err => {
                res.status(400).send("Unable to save to database");
            });
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
}


