var searchTag = require('../models/searchTagSchema');

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

module.exports = function searchTagAPI(app) {
    app.get('/getSearchTags', (req, res) => {
        searchTag.find(function (err, tags) {
            if (err) return console.error(err);
            res.send(JSON.stringify({ "results": tags }));
            }
        );
    })
}