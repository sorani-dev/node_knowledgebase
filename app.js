const path = require('path')

const bodyParser = require('body-parser')
const express = require('express')
const session = require('express-session');
const flash = require('connect-flash')
const { body,validationResult } = require('express-validator');
const mongoose = require('mongoose')

// Connect to the database
mongoose.connect('mongodb://localhost/nodekb');
const db = mongoose.connection;

// Check connection
db.once('open',function () {
    console.log('Connected to MongoDB');
})

// Check for db errors
db.on('error',function (err) {
    console.log(err);
})

// Init app
const app = express()

// Load View Engine
app.set('views',path.join(__dirname,'views'))
app.set('view engine','pug')

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(express.json())

// Express Session Middleware
app.set('trust proxy',1) // trust first proxy
const sess = {
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}
if (app.get('env') === 'production') {
    app.set('trust proxy',1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess))

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req,res,next) {
    res.locals.messages = require('express-messages')(req,res);
    next();
});



// Set Public folder
app.use(express.static(path.join(__dirname,'public')))

// Bring in the Models
const Article = require('./models/article');

// Routes
// Home Route
app.get('/',function (req,res) {
    Article.find({},(err,articles) => {
        if (err) {
            console.error(err)
            return
        }
        res.render('index',{
            title: 'Articles',
            articles
        });
    }
    )
})

// Route files
app.use('/articles',require('./routes/articles'))

const PORT = process.env.PORT || 5000

app.listen(PORT,() => console.log(`Server started on port ${PORT}`))