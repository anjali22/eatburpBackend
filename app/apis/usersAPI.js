var users = require('../../app/models/user');

var bodyParser = require('body-parser');
var Promise = require('promise');
var express = require('express');
var bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');

var app = express();

app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}));

module.exports = function usersAPI(app) {

    app.post("/signUp", (req, res) => {
        users.findOne({ email: req.body.email }, function (err, user) {
            if (err) throw err;
            if (user) {
                res.status(400).json({
                    error: "User already registered. Please login."
                })
            } else {
                var newUser = new users(req.body);
                newUser.first_name = '';
                newUser.last_name = '';
                console.log('newUser-----------', newUser);
                newUser.password = newUser.generateHash(req.body.password);
                newUser.save(function (err) {
                    if (err) throw err;
                })
                .then(item => {
                    console.log('item--------', item)
                    const JWTToken = jwt.sign({
                        _id: item._id
                    },
                        process.env.JWT_SECRET,
                    );
                    res.status(200).json({
                        success: 'Welcome to the JWT Auth',
                        token: JWTToken
                    });
                })
                .catch(err => {
                    res.status(400).json({ error: "Unable to sign up." });
                });
            }
        })

    });

    app.post("/signIn", (req, res) => {
        console.log(req.body);
        users.find({ email: req.body.email }, function (err, user) {
            console.log(user);
            if (err) {
                return res.send(err)
            } else if (!user) {
               return res.status(401).json({
                    error: 'Please register as new user'
                });
            } else if (!validPassword(req.body.password, user[0].password)) {
                return res.status(401).json({
                    error: 'Please enter correct password'
                });
            } else {
                console.log('user-------', user[0]._id)
                const JWTToken = jwt.sign({
                    _id: user[0]._id
                },
                    process.env.JWT_SECRET,
                );
                console.log(JWTToken);
                res.status(200).json({
                    success: 'Welcome to the JWT Auth',
                    token: JWTToken
                });
            }
        })
    });

    app.get("/getUserDetails", (req, res) => {
        var user_id;
        var token = req.headers['x-access-token'];
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            else {
                console.log('decoded-----------', decoded);
                user_id = decoded._id
            }
        });
        
        users.findById(user_id, function (err, user) {
            if(err) {
                return res.json({"error": err});
            } else {
                console.log('user', user);
                res.send(user)
            }
        })
    })

    var validPassword = function (password1, password) {
        //console.log("here------------", password, password1)
        var value = bcrypt.compareSync(password1, password);
        console.log(value);
        return value;
    };
}
