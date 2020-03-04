require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const { NODE_ENV } = require('./config')
const winston = require('winston')
const usersRouter = require('./users/users-router')
const listingsRouter = require('./listings/listings-router')
const matchesRouter = require('./matches/matches-router')
const commentsRouter = require('./comments/comments-router')
const imagesRouter = require('./images/images-router')
const authRouter = require('./auth/auth-router')

const app = express()

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common'

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use('/api/users', usersRouter)
app.use('/api/listings', listingsRouter)
app.use('/api/matches', matchesRouter) 
app.use('/api/comments', commentsRouter)
app.use('/api/images', imagesRouter)
app.use('/api/auth', authRouter)

const logger = winston.createLogger({
    level:'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'info.log' })
    ]
})

app.use(function errorHandler(error, req, res, next){
    let response
    if (NODE_ENV === 'production'){
        logger.add(new winston.transports.Console({
            format: winston.format.simple()
        }))
        response = { error: {message: 'server error'} }
    }else{
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})



module.exports = app