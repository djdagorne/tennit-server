const express = require('express')
const MatchesService = require('./matches-service')
const helpers = require('../../test/test-helpers')
const usersRouter = express.Router()
const jsonParser = express.json()

matchesRouter
    .route('/')
    //.get //to populate a user home page with their current matches
        //get all matches that contain a user_id on either user_id spot
    //.post //verify if previous match exists before creating new one.
    
matchesRouter
    .route('/:match_id')


module.exports = matchesRouter;