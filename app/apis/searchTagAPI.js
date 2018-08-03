var bodyParser = require('body-parser');
var Promise = require('promise');
var express = require('express');
const jwt = require('jsonwebtoken');
var app = express();
var async = require('async');

var searchTag = require('../models/searchTagSchema');
var restaurantSchema = require('../models/restaurantSchema');
var dishRestaurantMapping = require('../models/dishRestaurantMappingSchema');

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

    app.get("/searchRestaurants", (req, res) => {
        console.log(req.query);
        restaurantSchema.find({ "restaurant_name": { "$regex": req.query.searchedText, "$options": "i"}}, function (err, results) {
            if(err) return res.send(err);
            console.log(results);
            res.send(results);
        })
        
    });

    app.get("/searchDishes", (req, res) => {
        console.log(req.query);
        searchTag.find({ "search_tag": { "$regex": req.query.searchedText, "$options": "i" } }, {_id: 0}, function (err, results) {
            if (err) return res.send(err);
            console.log(results);
            res.send(results);
        })

    });

    app.get("/getDishSearchResults", (req, res) => {
        console.log(req.query);
        dishRestaurantMapping.find(
            { "search_tag": req.query.search_tag }, 
            {}, 
            { sort: { average_rating: -1 }, limit: 10 },
            function (err, results) {
                if (err) return res.send(err);
                console.log(results);
                res.send(results);
            }
        )
    })
}
