const { Router } = require('express')
const { body, validationResult } = require('express-validator');

const csrf = require('csurf')

const csrfProtection = csrf({ cookie: false })

const router = Router()

// Bring in the Article Model
const Article = require('../models/article')
// User Model
const User = require('../models/user')

// Add Article Route
router.get('/add', ensureAuthenticated, csrfProtection, function (req, res) {
    res.render('add_article', {
        title: 'Add Article',
        csrfToken: req.csrfToken()
    })
})

// Add Article Submit POST Route
router.post('/add',
    ensureAuthenticated,
    body('title').notEmpty().withMessage('Title is required'),
    // body('author').notEmpty().withMessage('Author is required'),
    body('body').notEmpty().withMessage('Content is required'),
    function (req, res) {

        const errors = validationResult(req)
        // console.log(errors)
        if (!errors.isEmpty()) {
            return res.render('add_article', {
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
                return res.render('add_article', {
                    title: 'Add Article',
                    article: {
                        title: req.body.title,
                        // author: req.body.author,
                        body: req.body.body,
                    }
                })
            }
            req.flash('success', 'Article Added')
            res.redirect('/')
        })
    })

// Edit an article (GET)
router.get('/edit/:id', ensureAuthenticated, csrfProtection, function (req, res) {
    Article.findById(req.params.id, function (err, article) {
        if (article.author != req.user._id) {
            req.flash('danger', 'Not Authorized')
            return res.status(403).redirect('/')
        }

        if (err) {
            console.error(err)
            res.status(404).send('Article not found')
            return
        }
        res.render('edit_article', {
            title: 'Edit Article',
            article,
            csrfToken: req.csrfToken()
        })
    })
})

// Edit an Article (POST)
router.post('/edit/:id',
    ensureAuthenticated,
    body('title').notEmpty().withMessage('Title is required'),
    // body('author').notEmpty().withMessage('Author is required'),
    body('body').notEmpty().withMessage('Content is required'),
    (req, res) => {
        const errors = validationResult(req)
        console.log(errors)
        if (!errors.isEmpty()) {
            return res.render('edit_article', {
                title: 'Edit Article',
                errors: errors.array(),
                article: {
                    title: req.body.title,
                    // author: req.body.author,
                    body: req.body.body,
                }
            })
        }

        const article = {}
        article.title = req.body.title
        article.author = req.user._id
        article.body = req.body.body

        Article.findOneAndUpdate(req.params.id, article, { returnDocument: true, new: true }, function (err) {
            if (article.author != req.user._id) {
                req.flash('danger', 'Not Authorized')
                return res.status(403).redirect('/')
            }

            if (err) {
                console.error(error)
                req.flash('danger', 'Could not update the article')

                // res.status(400).send('Could not update the article')
                return res.render('edit_article', {
                    title: 'Edit Article',
                    article: {
                        title: req.body.title,
                        // author: req.body.author,
                        body: req.body.body,
                    }
                })
            }
            req.flash('success', 'Article Updated')

            res.redirect('/')
        })
    })

// Delete an Article
router.delete('/:id', ensureAuthenticated, csrfProtection, (req, res) => {
    console.info('req.xhr', req.xhr, req.headers, req.session)

    if (!req.user._id) {
        if (req.xhr) {
            return res.status(500).send({ success: false, message: 'No Auth' })
        }
        return res.status(500).send()
    }

    Article.findById(req.params.id, {}, function (err, a) {
        //  article not found
        if (err) {
            console.log(err)
            return res.status(404).json({ message: err.message, success: false })
        }
        console.log(req.user, a)
        // author is not user
        if (a.author != req.user._id) {
            req.flash('danger', 'Not Authorized')
            if (req.xhr) {
                return res.status(403).json({ success: false, err: 'Not Authorized to delete this resource' })
            }
            return res.status(403).redirect('/')
        }
        console.log(a);
        Article.deleteOne({ _id: req.params.id }, {}, function (err) {
            console.log('158', err);
            if (err) {
                console.log(err)
                return res.status(404).json({ message: err.message, success: false })
            }
            res.send({ message: 'Success', success: true }).status(200)

        })
    })

})


// Get a Single Article
router.get('/:id', csrfProtection, function (req, res) {
    Article.findById(req.params.id, (err, article) => {
        if (err) {
            console.error(err.message)
            return res.status(404).render('errors/404', { message_title: '', message: 'Article not found' })
        }

        User.findById(article.author, (err, author) => {
            if (err) {
                console.error(err.message)
                return res.status(404).render('errors/404', { message_title: '', message: 'Article not found' })
            }

            res.render('article', {
                title: article.title,
                author: author.name,
                article,
                csrfToken: req.csrfToken()
            })
        })
    })
})

// Access Control Middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('danger', 'Please login')
    res.redirect('/users/login')
}

module.exports = router
