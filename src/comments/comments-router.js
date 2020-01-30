const express = require('express')
const helpers = require('../../test/test-helpers')
const CommentsService = require('./comments-service')
const commentsRouter = express.Router()
const jsonParser = express.json()

//then make the comments part of the endpoint, images part (mostly reusing code here)
// and auth part which will need a refresher but w.e
commentsRouter
    .route('/')
    .get((req,res,next)=>{
        res.status(400).json({
            error: {message: 'No match_id provided in params.'}
        })
    })
    .post(jsonParser,(req,res,next)=>{
        const {match_id, user_id, comment} = req.body;
        const newComment = {match_id, user_id, comment};
        for(const[key,value] of Object.entries(newComment)){
            if(value == null){
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                  })
            }
        }
        CommentsService.insertNewComment(
            req.app.get('db'),
            newComment
        )
            .then(comment=>{
                res.status(201).json(comment)
                next()
            })
            .catch(next)
    })
    
commentsRouter
    .route('/:match_id')
    .all((req,res,next)=>{
        CommentsService.getCommentsByMatchId(
            req.app.get('db'),
            req.params.match_id
        )
            .then(comments=>{
                if(comments.length){
                    res.comments = comments.map(comment=>CommentsService.sanitizeComment(comment))
                    next()
                }else{
                    res.status(404).json({
                        error: {message: 'Match_id not found.'}
                    })
                }
            })
            .catch(next)
    })
    .get((req,res,next)=>{
        res.json(res.comments)
    })

module.exports = commentsRouter;