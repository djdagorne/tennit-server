const express = require('express')
const helpers = require('../../test/test-helpers')
const MatchesService = require('./matches-service')
const matchesRouter = express.Router()
const jsonParser = express.json()

matchesRouter 
    .route('/')
    .get((req,res,next)=>{
        const {user_id} = req.query
        if(Number(user_id)){
            MatchesService.searchMatchesByUserId(
                req.app.get('db'), 
                user_id
            )
                .then(matches=>{
                    if(matches.length > 0){
                        res.json(matches)
                    }else{
                        res.status(404).json({
                            error: {message: `No match found.`}
                        })
                    }
                })
                .catch(next)
        }
        else{
            res.status(404).json({
                error: {message: `No valid query entered.`}
            })
        }
    })
    .post(jsonParser, (req,res,next)=>{
        const {user1_id, user2_id} = req.body;
        if(Number(user1_id) && Number(user2_id)){
            return MatchesService.checkExistingMatch(
                req.app.get('db'),
                user1_id,
                user2_id
            )
                .then(match=>{
                    if(!!match){
                        res.status(400).json({
                            error: {message: `Users already matched.`}
                        })
                    }else{
                        const userObject = {
                            user1_id,
                            user2_id
                        }
                        MatchesService.makeNewMatch(
                            req.app.get('db'),
                            userObject
                        )
                            .then(rows=>{
                                res.status(201).json(rows)
                            })
                    }
                })
                .catch(next)
        }
        next()
    })

matchesRouter
    .route('/:match_id')
    .all((req,res,next)=>{
        MatchesService.getMatchById(
            req.app.get('db'),
            req.params.match_id
        )
            .then(match=>{
                if(!match){
                    return res.status(404).json({
                        error: {message: `No match found.`}
                    })
                }
                res.match = match;
                next()
            })
            .catch(next)
    })
    .get((req,res,next)=>{
        res.json(res.match)
    })
    .delete((req,res,next)=>{
        MatchesService.deleteMatchById(
            req.app.get('db'),
            req.params.match_id
        )
            .then(()=>{
                res.status(204).end()
            })
            .catch(next)
    })


module.exports = matchesRouter;