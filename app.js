const path = require('path')

const bodyParser = require('body-parser')
const express = require('express')
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

// Add Article Route
app.get('/articles/add',function (req,res) {
    res.render('add_article',{
        title: 'Add Article'
    })
})

// Add Article Submit POST Route
app.post('/articles/add',function (req,res) {
    const article = new Article()
    article.title = req.body.title
    article.author = req.body.author
    article.body = req.body.body
    article.save(function (err) {
        if (err) {
            console.error(err)
            return
        }
        res.redirect('/')
    })
})

// Get a Single Article
app.get('/article/:id',function (req,res) {
    Article.findById(req.params.id,function (err,article) {
        if (err) {
            console.error(err)
            return
        }
        res.render('article',{
            title: article.title,
            article
        })
    })
})


const PORT = process.env.PORT || 5000

app.listen(PORT,() => console.log(`Server started on port ${PORT}`))