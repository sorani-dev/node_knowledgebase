const path = require('path')

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

const PORT = process.env.PORT || 5000

app.listen(PORT,() => console.log(`Server started on port ${PORT}`))