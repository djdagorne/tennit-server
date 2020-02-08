const express = require('express')
const helpers = require('../../test/test-helpers')
const MatchesService = require('./matches-service')
const UsersService = require('../users/users-service')
const matchesRouter = express.Router()
const jsonParser = express.json()
const {requireAuth} = require('../middleware/jwt-auth')

matchesRouter 
    .route('/')
    .get(requireAuth, (req,res,next)=>{
        const {user_id} = req.query
        if(Number(user_id)){
            UsersService.getUserById(
                req.app.get('db'),
                user_id
            )
                .then(user=>{
                    if(user){
                        MatchesService.searchMatchesByUserId(
                            req.app.get('db'), 
                            user_id
                        )
                            .then(matches=>{
                                if(matches.length > 0){
                                    res.json(matches)
                                }
                                if(matches === []){
                                    res.status(404).json({
                                        error: {message: `No matches found.`}
                                    })
                                }
                            })
                            .catch(next)
                    }else{
                        res.status(404).json({
                            error: {message: `No valid query entered.`}
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
    .post(requireAuth, jsonParser, (req,res,next)=>{
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
    .all(requireAuth, (req,res,next)=>{
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