var bodyParser = require('body-parser');
var Promise = require('promise');
var express = require('express');
const jwt = require('jsonwebtoken');
var app = express();
var async = require('async');

var searchTag = require('../models/searchTagSchema');
var restaurantSchema = require('../models/restaurantSchema');


app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}));

module.exports = function searchTagAPI(app) {
    app.get('/getSearchTags', (req, res) => {
        searchTag.find(function (err, tags) {
            if (err) return console.error(err);
            res.send(JSON.stringify({ "results": tags }));
            }
        );
    })

    app.post('/createSearchTags', (req, res) => {
        async.forEachOf(req.body.search_tag, function (tag, index, callback) {
            searchTag.findOneAndUpdate (
                {'search_tag': tag},
                { $setOnInsert: {'search_tag': tag}},
                {
                    upsert: true,
                    new: true
                }
            )
            .then(element => {
                console.log(index);
                console.log("data entered", element);
                callback();
            })
            .catch(err => {
                console.log(err);
                callback(err);
            })
        }, function(err) {
            console.log(err);
            res.send("All good");
        })
    });

    app.get("/searchRestaurant", (req, res) => {
        console.log(req.query);
        restaurantSchema.find({"restaurant_name": {"$regex": req.query.r_name, "$options": "i"}}, function (err, results) {
            if(err) return res.send(err);
            console.log(results);
            res.send(results);
        })
        
    })
}