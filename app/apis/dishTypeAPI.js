var dishTypeSchema = require('../models/dishTypeSchema');
var citySpecialSchema = require('../models/citySpecialSchema');

var bodyParser = require('body-parser');
var Promise = require('promise');
var express = require('express');
const jwt = require('jsonwebtoken');
var app = express();
var async = require('async');

app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}));

module.exports = function cuisineAPI(app) {
    app.get('/getDishType', (req, res) => {
        dishTypeSchema.find(function (err, type) {
            if (err) return console.error(err);
            results = []
            for (var i = 0; i < type.length; i++) {
                results[i] = {
                    name: type[i].dish_type
                }
            }
            res.send(JSON.stringify({ "results": results }));
        });
    });

    app.get('/getCitySpecial', (req, res) => {
        console.log("params------", req.query);
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
        citySpecialSchema.find({"city_name": req.query.c_name})
                         .populate('city_special_dishes')
                         .populate('city_special_restaurant_dish')
                         .exec(function (err, dish) {
                            if (err) return handleError(err);
                             console.log(dish);
                             res.send(dish);
                            // prints "The author is Ian Fleming"
                         })
    })
}