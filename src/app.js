require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { NODE_ENV } = require('./config')
const winston = require('winston')

const app = express();

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

const logger = winston.createLogger({
    level:'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'info.log' })
    ]
});

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
  
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
      return res.status(401).json({ error: 'Unauthorized request' })
    }
    // move to the next middleware
    next()
  })

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        logger.add(new winston.transports.Console({
            format: winston.format.simple()
        }))
        response = { error: {message: 'server error'} }; 
    } else {
        console.error(error);
        response = { message: error.message, error }
    }
    res.status(500).json(response);
})


app.get('/', (req, res) => {
    console.log(req)
    res.send('Hello, World!')
})

module.exports = app;