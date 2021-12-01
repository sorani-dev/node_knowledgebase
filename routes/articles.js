const { Router } = require('express')
const { body,validationResult } = require('express-validator');

const router = Router()

// Bring in the Article Model
const Article = require('../models/article')
// User Model
const User = require('../models/user')

// Add Article Route
router.get('/add',function (req,res) {
    res.render('add_article',{
        title: 'Add Article'
    })
})

// Add Article Submit POST Route
router.post('/add',
    body('title').notEmpty().withMessage('Title is required'),
    // body('author').notEmpty().withMessage('Author is required'),
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
                    // author: req.body.author,
                    body: req.body.body,
                }
            })
        }

        // Create an Article
        const article = new Article()
        article.title = req.body.title
        article.author = req.user._id
        article.body = req.body.body
        article.save(function (err) {
            if (err) {
                console.error(err)
                req.flash('An error occured. Could not add the article, try again later.')
                return res.render('add_article',{
                    title: 'Add Article',
                    article: {
                        title: req.body.title,
                        // author: req.body.author,
                        body: req.body.body,
                    }
                })
            }
            req.flash('success','Article Added')
            res.redirect('/')
        })
    })

// Edit an article (GET)
router.get('/edit/:id',function (req,res) {
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
router.post('/edit/:id',
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
router.delete('/:id',(req,res) => {
    Article.findById(req.params.id,{},function (err,a) {
        // console.log(a);
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


// Get a Single Article
router.get('/:id',function (req,res) {
    Article.findById(req.params.id)
        .then(article => {
            User.findById(article.author).then(author => {
                res.render('article',{
                    title: article.title,
                    author: author.name,
                    article
                })
            }).catch(err => {
                console.error(err)
                res.status(404).send('Article not found')
                return
            })
        }).catch(err => {
            console.error(err)
            res.status(404).send('Article not found')
        })
})

module.exports = router
