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
        res.json({
            error: {message: 'No match_id provided in params.'}
        })
    })
commentsRouter
    .route('/:match_id')
    .all((req,res,next)=>{
        CommentsService.getCommentByMatchId(
            req.app.get('db'),
            req.params.match_id
        )
            .then(comments=>{
                res.comments = comments.map(comment=>CommentsService.sanitizeComment(comment))
                next()
            })
    })
    .get((req,res,next)=>{
        res.json(res.comments)
    })

module.exports = commentsRouter;