var express = require("express");
var app = express();
var port = 3000;
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// required for passport
app.use(session({ secret: 'iloveatburp' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
require('./config/passport')(passport); // pass passport for configuration
//app.use(express.static(__dirname + '/addUser.'));

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

// process the login form
app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/profile', function(req, res) {
    res.sendFile(__dirname + "/profile.html");
    
})

app.get('/signup', function(req, res) {
    res.sendFile(__dirname + "/signup.html");
    
})
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));






//Dummy schema
var nameSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    url: String,
});
var dummy = mongoose.model("dummies", nameSchema);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/addname", (req, res) => {
    var myData = new dummy(req.body);
    console.log("myData------------", myData);
    myData.save(function(err){
        if (err) throw err;
    })
        .then(item => {
            res.send("Name saved to database");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

app.get("/search", (req,res) => {
    console.log("searching");
    console.log("query--------", req.query);
    //console.log("req---------", req.query.restoName, req.query.itemName, req.query.userName, req.query.comment, req.query.rating)
    dummy.find( {'firstName': req.query.userName}, (err, user) =>{ 
        if (err)
        { return console.error(err);}
        else{
        console.log("kittens----------", user);
        res.json({ docs: user })
        }
    });
});
/* ------------------------ end of dummy ----------------------*/

//User data
var userSchema = new mongoose.Schema({
    unique_name: String,
    name: String,
});
var users = mongoose.model("users", userSchema);

app.get('/addUser', function(req, res){
        console.log("jhihhi");

    res.sendFile(__dirname + '/addUser.html');
  });

app.post("/addUser", (req, res) => {
    var usersData = new users(req.body);
    console.log("usersData------------", usersData);
    usersData.save(function(err){
        if (err) throw err;
    })
        .then(item => {
            res.send("Name saved to database");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

app.get("/searchUser", (req,res) => {
    console.log("searching");
    users.find( 
            function (err, user) {
                if (err) return console.error(err);
                console.log("user----------", user);
                res.json({ docs: user })
            }
        );
});

/*---------------------- end of user data --------------*/

//restaurant data
var restoSchema = new mongoose.Schema({
    name: String,
    locality: String,
    address: String,
    category: String,
    cuisine: String,
    cost_for_two: Number,
    hours: String
});

var restos = mongoose.model("restaurants", restoSchema);

app.get("/getRestaurants",(req,res) => {
    restos.find(function(err, resto) {
        res.json({ docs: resto })
     });
});

app.get('/addResto', function(req, res){
        console.log("jhihhi");

    res.sendFile(__dirname + '/addResto.html');
  });

app.post("/addResto", (req, res) => {
    var restosData = new restos(req.body);
    console.log("restosData------------", restosData);
    restosData.save(function(err){
        if (err) throw err;
    })
        .then(item => {
            res.send("Name saved to database");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

app.get("/searchResto", (req,res) => {
    console.log("searching");
    restos.find( 
            function (err, resto) {
                if (err) return console.error(err);
                console.log("resto----------", resto);
                res.json({ docs: resto })
            }
        );
});


/*---------------------- end of resto data --------------*/

//Items data
var itemSchema = new mongoose.Schema({
    item_id: Number,
    name: String,
    cuisine: String,
    tags: [String],

});
var items = mongoose.model('items', itemSchema);

app.get('/addItem', function(req, res){
        console.log("jhihhi");

    res.sendFile(__dirname + '/addItem.html');
  });

app.post("/addItem", (req, res) => {
    var itemsData = new items(req.body);
    console.log("itemsData------------", itemsData);
    itemsData.save(function(err){
        if (err) throw err;
    })
        .then(item => {
            res.send("Name saved to database");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

app.get("/getFoodItems",(req,res) => {
    items.find(function(err, users) {
        res.json({ docs: users })
        //res.send(users);
     });
});

app.get("/searchItem", (req,res) => {
    // console.log("searching");
    // items.find( 
    //         function (err, item) {
    //             if (err) return console.error(err);
    //             console.log("item----------", item);

    //             res.send(item);
    //             //res.json({ docs: item })
    //         }
    //     );
    var response = {
        "title": "The Basics - Networking",
        "description": "Your app fetched this from a remote endpoint!",
        "movies": [
          { "title": "Star Wars", "releaseYear": "1977"},
          { "title": "Back to the Future", "releaseYear": "1985"},
          { "title": "The Matrix", "releaseYear": "1999"},
          { "title": "Inception", "releaseYear": "2010"},
          { "title": "Interstellar", "releaseYear": "2014"}
        ]
      }
      res.send(response);
      
});

/*---------------------- end of item data --------------*/

//reviews data
var reviewSchema = new mongoose.Schema({
    review_id: {"type": Number, "default": 1},
    comment_id: {"type": Number, "default": 1},
    comment: String,
    user_id: mongoose.Schema.Types.ObjectId,
    rating: Number
});
var reviews = mongoose.model("reviews", reviewSchema);

app.get('/addReview', function(req, res){
        console.log("jhihhi");

    res.sendFile(__dirname + '/addReview.html');
  });

app.post("/addReview", (req, res) => {
    //var reviewData = new reviews(req.body);
    var reviewData = req.body;
    var resto_item_rating_Data = new resto_item_rating();

    console.log("rreview data----------", reviewData);
    console.log(req.body)

    //get user_id from user collection
    restos.find({'name': req.body.restoName}, (err, restaurant) => {
        if(err){
            console.log("erroe--------", err);
        } else{
            console.log("restaurant details", restaurant[0]);
            resto_item_rating_Data.resto_id = restaurant[0]._id;
        }
    });

    items.find({'name': req.body.itemName}, (err, item) => {
        if(err){
            console.log("erroe--------", err);
        } else{
            console.log("item details", item[0]);
            resto_item_rating_Data.item_id = item[0]._id;
        }
    });



    users.find({'unique_name': req.body.userName}, (err, user) => {
        if(err) {
            console.log("Could not get the user with this name", err)
        } else{
            //console.log("user id", user._id);
            reviewData.user_id = user[0]._id;
            console.log("reviewData------------", reviewData);
            reviewData.save(function(err, review){
                if (err) throw err;
                else{
                    console.log("review id------", review._id);
                    resto_item_rating_Data.review_id = review._id;
                    console.log("resto_item_rating_Data------", resto_item_rating_Data)
                }
            })
            .then(item => {
                //res.send("Name saved to database");
                resto_item_rating_Data.save((err, data) => {
                    if(err) {
                        console.log("error in storing resto item data", err);
                    }else{
                        console.log("stored data-------", data);
                    }
                })
            })
            .catch(err => {
                res.status(400).send("Unable to save to database");
            });
        }
    });
});

// app.get("/searchReview", (req,res) => {
//     console.log("searching");
//     reviews.find( 
//             function (err, review) {
//                 if (err) return console.error(err);
//                 console.log("review----------", review);
//                 res.json({ docs: review })
//             }
//         );
// });

/*---------------------- end of review data --------------*/


//Add Rating/Review
var restoItemSchema = new mongoose.Schema({
    //id: Number,
    resto_id: String,
    //item_id: {id: mongoose.Schema.Types.ObjectId, name: String },
    item_id: String,
    //review_id: String,
    cost: Number,
    //user_id: mongoose.Schema.Types.ObjectId,
    //review_id:{id: [mongoose.Schema.Types.ObjectId], rating: [Number]},
    avg_rating: Number,


});
var resto_item_rating = mongoose.model("resto_item_ratings", restoItemSchema);

app.get('/addReview', function(req, res){
        console.log("jhihhi");

    res.sendFile(__dirname + '/addReview.html');
  });

app.post("/addReview", (req, res) => {
    var resto_item_rating_Data = new resto_item_rating(req.body);
    console.log("resto_item_rating_Data------------", resto_item_rating_Data);
    resto_item_rating_Data.save(function(err){
        if (err) throw err;
    })
        .then(item => {
            res.send("Name saved to database");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

app.get("/getTopRestaurants", ( req, res) => {
    console.log(req.body, " get top restaurant  ");
    var foodId = req.body.foodId;
    resto_item_rating.find( {item_id: "5a47439fce31f73679d3e5be"}, function (err, item) {
            if (err) return console.error(err);
            console.log("item----------", item);
            res.json({ docs: item })
        }
    );

});

app.get("/searchReview", (req,res) => {
    console.log("searching");
    resto_item_rating.find( 
            function (err, item) {
                if (err) return console.error(err);
                console.log("item----------", item);
                res.json({ docs: item })
            }
        );
});

/*---------------------- end of item data --------------*/


/*----------------------- google maps-------------------*/
let jsonData = require('./data/restaurants2.json');
var request = require('request');
const key = " AIzaSyCyoaI8dLQXdbax24-J2SaH6kJoFQJXypc ";
const keySurbhi = "AIzaSyBsMwfs-6DFGEOIU7qSaEOz5Z6pYFayDFU";
const url = "https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY"; 
var csv = require('fast-csv');
//var fs = require('fs');
var lat = new Array();
var lng = new Array();
var name = new Array();
var async = require('async');
app.get("/getCoordinates", (req,res) => {

    var csvstream = csv.createWriteStream({headers: true});
    var writableStream = fs.createWriteStream("./test.csv"); 
    csvstream.pipe(writableStream);

    async.forEachOf(jsonData, function(value, i, callback) {
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?address='+value.address+',Indore&key=AIzaSyBsMwfs-6DFGEOIU7qSaEOz5Z6pYFayDFU';
        apicall(url, value.name, callback);
        
    }, function(err) {
        for( i =0;i<jsonData.length;i++){
                csvstream.write({
                    name: name[i],
                    latitude: lat[i],
                    longitude: lng[i]
                })
            }
        console.log('this is callback------')
    });

    function apicall(url,resto, callback) {
        //console.log('url------', url)
        
        request(url, function (error, response, results) {
            var obj = {};
            //console.log('name------', jsonData[i].name);
            obj = JSON.parse(results);
            if (!error && obj.status === 'OK') {
              //console.log(body);
              
              //console.log('obj-----', obj)
              name.push(resto);
              lat.push(obj.results[0].geometry.location.lat);  
              lng.push(obj.results[0].geometry.location.lng);
              console.log('lat------', lat, 'lng--------', lng, 'name------', name);
              callback();
              //console.log('location array---', location);
            } else {
                name.push(resto);
                lat.push(0);  
                lng.push(0);
                callback();
            }
        });
        
    }
//     let url='https://maps.googleapis.com/maps/api/geocode/json?address='+'13, Regency Arcade, Navratan Bagh, Geeta Bhavan, Indore'+'&key=AIzaSyCyoaI8dLQXdbax24-J2SaH6kJoFQJXypc';
//         request(url, function (error, response, results) {
//         //     var obj = {};
//             obj = JSON.parse(results);
//             if (!error && response.statusCode == 200) {
//                console.log(obj.results[0].geometry.location.lat); 
// //csvstream.write({ name: })
//             }
//           });
    //console.log(jsonData);

    // for( i =0;i<4;i++){
    //     console.log('jsonData-------', jsonData[i])
    //     let url='https://maps.googleapis.com/maps/api/geocode/json?address='+jsonData[i].address+'&key=AIzaSyCyoaI8dLQXdbax24-J2SaH6kJoFQJXypc';
    //     request(url, function (error, response, results) {
    //         if (!error && response.statusCode == 200) {
    //           //console.log(body);
    //           var obj = {};
    //           console.log('name------', jsonData[i].name);
    //           obj = JSON.parse(results);
    //           console.log('obj-----', obj)
    //           lat.push(obj.results[0].geometry.location.lat);  
    //           lng.push(obj.results[0].geometry.location.lng);
    //           console.log('lat------', lat, 'lng--------', lng);
    //           //console.log('location array---', location);
    //         }
    //     });
    // //console.log(jsonData[i].name);
    // }
    //     for( i =0;i<4;i++){
    //         csvstream.write({
    //             name: jsonData[i].name,
    //             latitude: lat[i],
    //             longitude: lng[i]
    //         })
    //     }
   

});

app.listen(port, () => {
    console.log("Server listening on port " + port);
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    
        // if user is authenticated in the session, carry on 
        if (req.isAuthenticated())
            return next();
    
        // if they aren't redirect them to the home page
        res.redirect('/');
}