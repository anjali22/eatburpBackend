var mealSchema = require('../models/mealSchema');
var dishRestaurantMappingSchema = require('../models/dishRestaurantMappingSchema');
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
    });

    app.get('/topDishesOfMeal', (req, res) => {
        console.log("req.query", req.query);
        dishRestaurantMappingSchema.find(
                                { "meal": req.query.meal }, 
                                {}, 
                                { sort: { average_rating: -1 }, limit: 10 },
                                function name(err, dishes) {
                                    if (err) {
                                        res.status(500).send({ message: 'Please wait for some time and try again.', error: err })
                                    } else {
                                        res.status(200).send({ message: "Here are top 10 dishes", success: dishes });
                                    }
                                })
    })
}