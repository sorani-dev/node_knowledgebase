const { Router } = require('express')
const { body,check,validationResult } = require('express-validator')
const bcrypt = require('bcrypt')

const router = Router()

// Bring in the User Model
const User = require('../models/user')
const passport = require('passport')

// Register Form (GET)
router.get('/register',(req,res) => {
    res.render('register')
})

// Register Submit (POST)
router.post('/register'
    ,check('name','Name is Required').notEmpty()
    ,check('username','Username is Required').notEmpty()
    ,check('email','Email is Required').notEmpty()
    ,body('email','Please enter a valid email').isEmail()
    ,check('password','Password is Required').notEmpty()
    ,body('password2','Password do not match').custom((value,{ req }) => {
        return (value === req.body.password);
    })
    ,(req,res) => {

        // Get form data
        const { name,username,email,password,password2 } = req.body

        // Check if any error found
        const errors = validationResult(req)
        console.log(errors)
        if (!errors.isEmpty()) {
            return res.render('register',{
                errors: errors.array(),
                name,
                username,
                email
            })
        }

        const newUser = new User({
            name,
            username,
            email,
            password
        })

        bcrypt.genSalt(12,function (err,salt) {
            bcrypt.hash(password,salt).then(hash => {
                newUser.password = hash
                newUser.save(err => {
                    if (err) {
                        console.error(err);
                        return
                    }
                    req.flash('success','You are now registered and can log in.')
                    res.redirect('/users/login')
                })
            })
                .catch(err => {
                    console.log(err)
                })
        })

    })


// Login Form (GET)
router.get('/login',(req,res) => {
    return res.render('login')
})

// Login Process (POST)
router.post('/login',(req,res,next) => {
    passport.authenticate('local',{
        successRedirect: '/'
        ,failureRedirect: '/users/login'
        ,failureFlash: true,
    })(req,res,next)
})

module.exports = router