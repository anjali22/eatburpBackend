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

app.use(function (req, res, next) {
    //set headers to allow cross origin request.
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
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
});
var restos = mongoose.model("restaurants", restoSchema);

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

/** Search restaurant and return just there id and name. */
app.get("/searchRestoName", (req,res) => {
    console.log("searching");
    restos.find({},{name: 1}, 
            function (err, resto) {
                if (err) return console.error(err);
                //console.log("resto----------", resto);
                //res.json({ docs: resto })
                res.send(JSON.stringify({"results":resto}));
            }
        );
});

app.get("/searchResto", (req, res) => {
    console.log("searching");
    restos.find({},
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
        console.log(users);
        res.json({docs: users});
     });
});

app.get("/searchItem", (req,res) => {
    console.log("searching");
    items.find(
            function (err, item) {
                if (err) return console.error(err);
                console.log("item----------", item);
                res.json({ docs: item })
            }
        );
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
    var reviewData = new reviews(req.body);
    var resto_item_rating_Data = new resto_item_rating();

    console.log("rreview data----------", reviewData);
    console.log(req.body)

    //get user_id from user collection
    restos.find({'name': req.body.restoName}, (err, restaurant) => {
        if(err){
            console.log("erroe--------", err);
        } else{
            console.log("restaurant details", restaurant);
            resto_item_rating_Data.resto_id = restaurant[0]._id;
        }
    });

    items.findOneAndUpdate({ 'name': req.body.itemName }, { 'name': req.body.itemName }, { upsert: true, new: true }, (err, item) => {
        if(err){
            console.log("erroe--------", err);
        } else{
            console.log("item details", item);
            resto_item_rating_Data.item_id = item._id;
        }
    });



    users.find({'email': req.body.userName}, (err, user) => {
        if(err) {
            console.log("Could not get the user with this name", err)
        } else{
            console.log("user id", user);
            //reviewData.user_id = user[0]._id;
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
    id: Number,
    resto_id: String,
    //item_id: {id: mongoose.Schema.Types.ObjectId, name: String },
    item_id: String,
    //review_id: [mongoose.Schema.Types.ObjectId],
    cost: Number,
    //user_id: mongoose.Schema.Types.ObjectId,
    //review_id:{id: [mongoose.Schema.Types.ObjectId], rating: [Number]},
    avg_rating: Number,
});
var resto_item_rating = mongoose.model("resto_item", restoItemSchema);

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

app.get("/searchReview", (req,res) => {
    console.log("searching");
    resto_item_rating.find({},
            function (err, item) {
                if (err) return console.error(err);
                console.log("item----------", item);
                res.json({ docs: item })
            }
        );
});

/** feeding menu of a restaurant */
app.post("/addMenu", (req, res) => {
    console.log(req.body);
    res.send("added");
})

/*---------------------- end of item data --------------*/

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