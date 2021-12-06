const path = require('path')

const express = require('express')
const passport = require('passport')
const session = require('express-session');
const helmet = require('helmet')
const MongoStore = require('connect-mongo');

const mongoose = require('mongoose')

const config = require('./config/database')

// Connect to the database
mongoose.connect(config.database);
const db = mongoose.connection;

// Check connection
db.once('open', function () {
    console.log('Connected to MongoDB');
})

// Check for db errors
db.on('error', function (err) {
    console.log(err);
})

// Init app
const app = express()

// Load View Engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))

// parse application/json
app.use(express.json())

// Helmet protection
app.use(helmet())

// Express Session Middleware
app.set('trust proxy', 1) // trust first proxy
const expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
const sess = {
    name: 'sessionId',
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        //     domain: 'localhost:5000',
        //     path: '/',
        //     expires: expiryDate
    },
    store: MongoStore.create({
        client: db.getClient(),
        // stringify: false,
        // autoRemove: 'interval',
        // autoRemoveInterval: 1
    }),
}

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess))

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});



// Set Public folder
app.use(express.static(path.join(__dirname, 'public')))

// Passport config
require('./config/passport')(passport)
// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Csrf
const csrf = require('csurf');
const csurf = require('csurf');
const csrfProtection = csrf({ cookie: false, ignoreMethods: ['HEAD', 'OPTIONS'] })

// Mongo Sanitize Middleware
const mongoSanitize = require('express-mongo-sanitize')
app.use(mongoSanitize({ replaceWith: '_', onSanitize: ({ req, key }) => console.warn(`This request[${key}] is sanitized`, req); }))

// HTTP Middleware
const hpp = require('hpp')
app.use(hpp())

app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        console.info('is auth csrf')
        app.use(csrfProtection)
        // csrfProtection(req,res,next)
        // csrf
        // app.locals.csrf = req.csrfToken()
        // return next()
    }
    return next()
})
// // Bring in the Models
// const Article = require('./models/article');

// Routes
// Populate user on all routes if available
app.get('*', (req, res, next) => {
    res.locals.user = req.user || null
    next()
})
// Route files
app.use('/', require('./routes/index'))
app.use('/articles', require('./routes/articles'))
app.use('/users', require('./routes/users'))

// Error handlers
app.use(function (req, res, next) {
    res.status(404);

    res.format({
        html: function () {
            res.render('errors/404', { url: req.url })
        },
        json: function () {
            res.json({ error: 'Not found' })
        },
        default: function () {
            res.type('txt').send('Not found')
        }
    })
})
app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)

    // handle CSRF token errors here
    res.status(403)
    res.send('form tampered with')
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))