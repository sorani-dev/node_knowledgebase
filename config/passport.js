const bcrypt = require('bcrypt')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const config = require('../config/database')

module.exports = function (passport) {

    // Local Strategy
    passport.use(new LocalStrategy(
        function (username,password,done) {
            // Match Username
            User.findOne({ username: username })
                .then(user => {
                    if (!user) {
                        return done(null,false,{ message: 'Invalid credentials' })
                        return done(null,false,{ message: 'No user found' })
                    }

                    // Match Password
                    bcrypt.compare(password,user.password,(err,isMatch) => {
                        if (err) {
                            throw err
                        }
                        if (isMatch) {
                            return done(null,user)
                        }
                        return done(null,false,{ message: 'Invalid credentials' })
                        return done(null,false,{ message: 'Invalid password' })
                    })

                }).catch(err => {
                    return done(null,false,{ message: err })
                })
        }
    ))

    passport.serializeUser((user,done) => {
        done(null,user.id)
    })

    passport.deserializeUser((id,done) => {
        User.findById(id,(err,user) => {
            done(err,user)
        })
    })
}
