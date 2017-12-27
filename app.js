var express = require("express");
var app = express();
var port = 3000;
var bodyParser = require('body-parser');
var fileparser = require('connect-multiparty')();
var router = express.Router();


var fs = require("fs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(express.static(__dirname + '/addUser.'));

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/eatBurp");
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("we're connected!");
  });

console.log("connected or not???",mongoose.connection.readyState);
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
var items = mongoose.model('food', itemSchema);

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

app.get("/searchReview", (req,res) => {
    console.log("searching");
    reviews.find( 
            function (err, review) {
                if (err) return console.error(err);
                console.log("review----------", review);
                res.json({ docs: review })
            }
        );
});

/*---------------------- end of review data --------------*/


//Add Rating/Review
var restoItemSchema = new mongoose.Schema({
    resto_id: mongoose.Schema.Types.ObjectId,
    //item_id: {id: mongoose.Schema.Types.ObjectId, name: String },
    item_id: mongoose.Schema.Types.ObjectId,
    review_id: [mongoose.Schema.Types.ObjectId],
    //user_id: mongoose.Schema.Types.ObjectId,
    //review_id:{id: [mongoose.Schema.Types.ObjectId], rating: [Number]},
    avg_rating: Number,
});
var resto_item_rating = mongoose.model("resto_item_rating", restoItemSchema);

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
    resto_item_rating_Data.find( 
            function (err, item) {
                if (err) return console.error(err);
                console.log("item----------", item);
                res.json({ docs: item })
            }
        );
});

/*---------------------- end of item data --------------*/





app.listen(port, () => {
    console.log("Server listening on port " + port);
});