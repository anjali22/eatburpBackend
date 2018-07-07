var dishTypeSchema = require('../models/dishTypeSchema');

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
    })
}