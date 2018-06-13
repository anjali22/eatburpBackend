var cuisineSchema = require('../models/cuisineSchema');

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
    app.get('/getCuisines', (req, res) => {
        cuisineSchema.find(function (err, cuisines) {
            if (err) return console.error(err);
            results = []
            for (var i = 0; i < cuisines.length; i++) {
                results[i] = {
                    name: cuisines[i].cuisine_name
                }
            }
            res.send(JSON.stringify({ "results": results }));
        });
    })
}