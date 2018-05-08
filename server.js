// dependencies
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware
app.use(session({
    secret: "rubberbabybuggybumpers",
    name: 'cookie_monster',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

app.use(favicon(path.join(__dirname, './public', 'images', 'user-favicon.ico')));
app.use(express.static(path.join(__dirname, './public')));
app.use(express.static(path.join(__dirname, './bower_components')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/login_reg')
    .then(success => {
        console.log("connected to db");
    })
    .catch(err => {
        console.log("unable to connect to database");
    })

// user schema
const UserSchema = new mongoose.Schema({
    first_name: {type: String, required: [true, 'First name cannot be blank']},
    last_name: {type: String, required: [true, 'Last name cannot be blank']},
    email: {type: String, required: [true, 'Email cannot be blank'], lowercase: true},
    password: {type: String, required: true}
}, {timestamps: true})

mongoose.model('User', UserSchema);
const User = mongoose.model('User');

app.get('/', function(req, res) {
    res.render('index');
})

app.post('/register', function(req, res) {
    var error_message = [];
    var password = req.body.password;
    User.find({email: req.body.email}, function(err, user) {
        if(err){
            error_message.push("server fail")
        }
        else {
            if(user.length > 0) {
                error_message.push("email already exists")
            }
            else if(password === req.body.cpassword) {
                bcrypt.hash(password, 10, function(err, hash) {
                    if(err){
                        error_message.push("server fail")
                    }
                    else {
                        password = hash;
                        var newUser = new User({
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            email: req.body.email,
                            password: password
                        })
                        newUser.save(function(){
                            res.render('success', {user: newUser});
                        })
                    }
                })      
            }
            else {
                error_message.push("something went wrong")
                res.render('failed', {errors: error_message});
            }
        }
    })                  
})

// user login
app.post('/login', function(req, res) {
    var error_message = [];
    console.log(req.body.login_email);
    User.findOne({email: req.body.login_email}, function(err, user) {
        if(err){
            error_message.push("shits fucked")
        }
        else if(user === null)
        {
            error_message.push("sigh....")
        }
        else {
            bcrypt.compare(req.body.login_password, user.password, function(err, result) {
                if(err) {
                    error_message.push("still fucked, what did you expect?")
                }
                else {
                    res.render('success', {user: user});
                }
            })
        }
        if(error_message.length > 0) {
            res.render('failed', {errors: error_message});
        }
    })
        
        
            
    
})

// user in session redirect to success
app.get('/success', function(req, res, next) {
    res.render('success')
})
// something went wrong
app.get('/failed', function(req, res, next) {
    res.render('failed')
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return res.render('index');
})

app.listen(8000, function() {
    console.log("Power Overwhelming...")
})