const express = require('express')
const helpers = require('../../test/test-helpers')
const MatchesService = require('./matches-service')
const matchesRouter = express.Router()
const jsonParser = express.json()

matchesRouter
    .route('/:user_id')
    .get((req,res,next)=>{
        const user_id = req.params.user_id
        MatchesService.searchMatchesByUserId(req.app.get('db'), user_id)
            .then(matches=>{
                if(matches){
                    res.json(matches)
                }
                return res.status(404).json({
                    error: {message: `Match doesn't exist`}
                })
            })
            .catch(next)
    })
    //.get //to populate a user home page with their current matches
        //get all matches that contain a user_id on either user_id spot
    //.post //verify if previous match exists before creating new one.


module.exports = matchesRouter;