var express = require("express");
var app = express();
var port = 3000;
var bodyParser = require('body-parser');
var fileparser = require('connect-multiparty')();
var router = express.Router();
var passport = require('passport');
var flash    = require('connect-flash');
var routes = require('./app/routes');
var foodItemAPI = require('./app/foodItemAPI');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');

var fs = require("fs");
var uri = process.env.MLAB_URL;
var path = require('path'),
fs = require('fs');

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'iloveatburp', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

    
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({ extended: true }));
 
require('./config/passport')(passport); // pass passport for configuration

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

mongoose.connect(uri, {
    useMongoClient: true,
    
});
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("we're connected!");
  });

console.log("connected or not???",mongoose.connection.readyState);

app.use(function (req, res, next) {
    //set headers to allow cross origin request.
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
    next();
});

app.options("/*", (req, res) => {
    console.log("options successful");
    res.send("options successful");
})

// s3 setup
var AWS = require('aws-sdk');
var dotenv = require('dotenv');
dotenv.config();

AWS.config.update({
    region: 'us-east-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// routes ======================================================================
require('./app/routes.js')(app, AWS); // load our routes and pass in our app and fully configured passport
require('./app/foodItemAPI.js')(app);
require('./app/apis/usersAPI.js')(app);
require('./app/apis/searchTagAPI')(app);
require('./app/apis/cuisineAPI')(app);
require('./app/apis/mealAPI')(app);
require('./app/apis/employeesAPI')(app);
require('./app/apis/dishRestaurantMappingAPI')(app);
require('./app/s3ImageSaving');

app.listen(process.env.PORT || 3000, function(){
    console.log('listening on', port);
});