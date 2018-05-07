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
mongoose.connect('mongodb://localhost:27017/login_reg');

// user schema
const UserSchema = new mongoose.Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    email: {type: String, required: true, lowercase: true, unique: true},
    password: {type: String, required: true}
}, {timestamps: true})

mongoose.model('User', UserSchema);
const User = mongoose.model('User');

app.get('/', function(req, res, next){
    res.render('index');
})


app.post('/register', function(req, res, next) {
    // new user registration
    var password = req.body.password;
    var cpassword = req.body.cpassword;
    if(password != cpassword)
    {
        console.log('passwords do not match')
        res.redirect('/failed');
    }
    else
    {
        var user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: hash
        })

        user.save(function(err) {
            if(err) {
                res.redirect('/failed', {errors: err});
                console.log(err)
            } else {
                console.log('successfully added a user!')
                res.redirect('/success');
            }
        })

        bcrypt.hash(password, 10, function(err, hash) {    
   
        })
    }
})
// user login
app.post('/login', function(req, res, next) {
    res.redirect('/');
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