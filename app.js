const express = require('express')

// Init app
const app = express()


// Routes
app.get('/',function (req,res) {
    res.send('hello');
})

const PORT = process.env.PORT || 5000

app.listen(PORT,() => console.log(`Server started on port ${PORT}`))