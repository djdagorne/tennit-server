const express = require('express')
const UsersService = require('./users-service')
const helpers = require('../../test/test-helpers')
const usersRouter = express.Router()
const jsonParser = express.json()

listingRouter
    .get('/')