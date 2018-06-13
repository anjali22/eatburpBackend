var mealSchema = require('../models/mealSchema');

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

module.exports = function mealAPI(app) {
    app.get('/getMeals', (req, res) => {
        mealSchema.find(function (err, meals) {
            if (err) return console.error(err);
            results = []
            for(var i=0; i< meals.length; i++) {
                results[i] = {
                    name: meals[i].meal_name
                }
            }
            res.send(JSON.stringify({ "results": results }));
        });
    })
}