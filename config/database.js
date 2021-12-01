const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.join(__dirname,'..','.env') })

module.exports = {
    database: process.env.DATABASE_URI || 'mongodb://localhost/nodekb',
    secret: process.env.APP_SECRET || 'yournotsosecretkey'
}