const express = require('express')
const path = require('path')

// Init app
const app = express()

// Load View Engine
app.set('views',path.join(__dirname,'views'))
app.set('view engine','pug')

// Routes
// Home Route
app.get('/',function (req,res) {
    const articles = [
        {
            id: 1,
            title: 'Article One',
            author: 'Sorani',
            body: 'This is article one'
        },
        {
            id: 2,
            title: 'Article Two',
            author: 'John Doe',
            body: 'This is article two'
        },
        {
            id: 3,
            title: 'Aticle Three',
            author: 'Riku Nyaruko',
            body: 'This is article three'
        },
    ]
    res.render('index',{
        title: 'Articles',
        articles
    });
})

// Add Article Route
app.get('/articles/add',function (req,res) {
    res.render('add_article',{
        title: 'Add Article'
    })
})

const PORT = process.env.PORT || 5000

app.listen(PORT,() => console.log(`Server started on port ${PORT}`))