var express = require("express");
var app = express();
var port = 8081;
var bodyParser = require('body-parser');
var fileparser = require('connect-multiparty')();
var router = express.Router();
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');

var fs = require("fs");
var uri = 'mongodb://admin:admin@ds251985.mlab.com:51985/eatburp';
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
 //app.use(bodyParser({uploadDir:'/path/to/temporary/directory/to/store/uploaded/files'}));
// // required for passport
// app.use(session({ secret: 'iloveatburp' })); // session secret
// app.use(passport.initialize());
// app.use(passport.session()); // persistent login sessions
// app.use(flash()); // use connect-flash for flash messages stored in session
require('./config/passport')(passport); // pass passport for configuration
//app.use(express.static(__dirname + '/addUser.'));


// // set up our express application
// app.use(morgan('dev')); // log every request to the console
// app.use(cookieParser()); // read cookies (needed for auth)
// app.use(bodyParser()); // get information from html forms

// app.set('view engine', 'ejs'); // set up ejs for templating


var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

//mongoose.connect("mongodb://localhost:27017/eatBurp");
mongoose.connect(uri, {
    useMongoClient: true,
    
});
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("we're connected!");
  });

console.log("connected or not???",mongoose.connection.readyState);


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// app.listen(port, () => {
//     console.log("Server listening on port " + port);
// });

app.listen(process.env.PORT || 8081, function(){
    console.log('listening on', port);
  });