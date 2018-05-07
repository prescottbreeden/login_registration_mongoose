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

mongoose.connect('mongod://localhost:27017/login_reg')
    .then(() => {
        console.log("connected to db");
    })
    .catch(() => {
        console.log("unable to connect to database");
    })

// user schema
const UserSchema = new mongoose.Schema({
    first_name: {type: String, required: [true, 'First name cannot be blank']},
    last_name: {type: String, required: [true, 'Last name cannot be blank']},
    email: {type: String, required: [true, 'Email cannot be blank'], lowercase: true, unique: true},
    password: {type: String, required: true}
}, {timestamps: true})

mongoose.model('User', UserSchema);
const User = mongoose.model('User');

app.get('/', (req, res, next) => {
    res.render('index');
})


app.post('/register', (req, res, next) => {
    // new user registration
    var password = req.body.password;
    var cpassword = req.body.cpassword;
    if(password != cpassword)
    {
        console.log('passwords do not match')
        res.render('failed', {errors: "passwords do not match"});
    }
    else
    {
        bcrypt.hash(password, 10)
            .then((hash) => {    
                password = hash;
            })
            .catch((err) => {
                console.log(err);
            })

        var user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: password
        })

        user.save()
            .then((user) => {
                console.log('successfully added a user!')
                console.log(user);
                res.render('success', {user: user});
            })
            .catch((err) => {
                res.render('failed', {errors: err});
                console.log(err);
            })
    }
})

// user login
app.post('/login', (req, res, next) => {
    User.findOne({email: req.body.email})
        .then((user) => {
            if(user.password !== req.body.password)
            {
                console.log("password doesn't match stored password")
            }
            else
            {
                console.log(`${user.name} has logged in to server`);
                res.render('success', {user: user});
            }
        })
        .catch((err) => {
            console.log(err);
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