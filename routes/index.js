const { Router } = require('express')

const router = Router()

// Bring in the Models
const Article = require('../models/article');

// Home Route
router.get('/',function (req,res) {
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

module.exports = router