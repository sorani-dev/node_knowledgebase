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

// Add Article Route
app.get('/articles/add',function (req,res) {
    res.render('add_article',{
        title: 'Add Article'
    })
})

// Add Article Submit POST Route
app.post('/articles/add',
    body('title').notEmpty().withMessage('Title is required'),
    body('author').notEmpty().withMessage('Author is required'),
    body('body').notEmpty().withMessage('Content is required'),
    function (req,res) {

        const errors = validationResult(req)
        // console.log(errors)
        if (!errors.isEmpty()) {
            return res.render('add_article',{
                title: 'Add Article',
                errors: errors.array(),
                article: {
                    title: req.body.title,
                    author: req.body.author,
                    body: req.body.body,
                }
            })
        }

        // Create an Article
        const article = new Article()
        article.title = req.body.title
        article.author = req.body.author
        article.body = req.body.body
        article.save(function (err) {
            if (err) {
                console.error(err)
                req.flash('An error occured. Could not add the article, try again later.')
                return res.render('add_article',{
                    title: 'Add Article',
                    article: {
                        title: req.body.title,
                        author: req.body.author,
                        body: req.body.body,
                    }
                })
            }
            req.flash('success','Article Added')
            res.redirect('/')
        })
    })

// Get a Single Article
app.get('/article/:id',function (req,res) {
    Article.findById(req.params.id,function (err,article) {
        if (err) {
            console.error(err)
            res.status(404).send('Article not found')
            return
        }
        res.render('article',{
            title: article.title,
            article
        })
    })
})

// Edit an article (GET)
app.get('/article/edit/:id',function (req,res) {
    Article.findById(req.params.id,function (err,article) {
        if (err) {
            console.error(err)
            res.status(404).send('Article not found')
            return
        }
        res.render('edit_article',{
            title: 'Edit Article',
            article
        })
    })
})

// Edit an Article (POST)
app.post('/article/edit/:id',
    body('title').notEmpty().withMessage('Title is required'),
    body('author').notEmpty().withMessage('Author is required'),
    body('body').notEmpty().withMessage('Content is required'),
    (req,res) => {
        const errors = validationResult(req)
        console.log(errors)
        if (!errors.isEmpty()) {
            return res.render('edit_article',{
                title: 'Edit Article',
                errors: errors.array(),
                article: {
                    title: req.body.title,
                    author: req.body.author,
                    body: req.body.body,
                }
            })
        }

        const article = {}
        article.title = req.body.title
        article.author = req.body.author
        article.body = req.body.body

        Article.findOneAndUpdate(req.params.id,article,{ returnDocument: true,new: true },function (err) {
            if (err) {
                console.error(error)
                req.flash('danger','Could not update the article')

                // res.status(400).send('Could not update the article')
                return res.render('edit_article',{
                    title: 'Edit Article',
                    article: {
                        title: req.body.title,
                        author: req.body.author,
                        body: req.body.body,
                    }
                })
            }
            req.flash('success','Article Updated')

            res.redirect('/')
        })
    })

// Delete an Article
app.delete('/article/:id',(req,res) => {
    Article.findById(req.params.id,{},function (err,a) {
        console.log(a);
        Article.deleteOne({ _id: req.params.id },{},function (err) {
            if (err) {
                console.log(err)
                res.json({ message: err,success: false }).status(400)
                return
            }
            res.send({ message: 'Success',success: true }).status(200)

        })
    })

})

const PORT = process.env.PORT || 5000

app.listen(PORT,() => console.log(`Server started on port ${PORT}`))