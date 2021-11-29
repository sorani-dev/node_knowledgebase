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
    res.render('index',{
        title: 'Articles'
    });
})

const PORT = process.env.PORT || 5000

app.listen(PORT,() => console.log(`Server started on port ${PORT}`))