// dependencies
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');

// mongoose
const mongoose = require('mongoose');
const url = 'mongod://localhost:27017/login_reg'
mongoose.connect(url);

// bcrypt
const bcrypt = require('bcrypt');
const saltrounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

const app = express();

// app setup
app.use(session({secret: "rubberbabybuggybumpers"}));
app.use(favicon(path.join(__dirname, './public', 'images', 'user-favicon.ico')));
app.use(express.static(path.join(__dirname, './public')));
app.use(express.static(path.join(__dirname, './bower_components')));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join('./views'));
app.set('view engine', 'ejs');

// user schema
const UserSchema = new mongoose.Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    email: {type: String, required: true, lowercase: true, unique: true},
    passwordHash: {type: String, required: true}
}, {timestamps: true})

mongoose.model('User', UserSchema);
const User = mongoose.model('User');

//----------------//
//---- Routes ----//
//----------------//

// register and login forms
app.get('/', function(req, res){

    res.render('index');
})

// new user registration
app.post('/register', function(req, res) {
    console.log("POST DATA", req.body);
    var password = req.body.password;
    var cpassword = req.body.cpassword;
    if(password != cpassword)
    {
        console.log('passwords do not match')
        res.redirect('/');
    }
    else
    {
        var user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
        })

        user.save(function(err) {
            if(err) {
                console.log('something went wrong')
                res.render('/');
            } else {
                console.log('successfully added a user!')
                res.redirect('/success');
            }
        })
    }
    
})

// user login
app.post('/login', function(req, res) {

    res.redirect('/');
})

// user in session redirect to success
app.get('/success', function(req, res) {

    res.render('success')
})

//----------------//
//-- End Routes --//
//----------------//

app.listen(8000, function() {
    console.log("Power Overwhelming...")
})