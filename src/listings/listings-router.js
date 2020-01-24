const express = require('express')
const ListingsService = require('./listings-service')
const helpers = require('../../test/test-helpers')
const listingRouter = express.Router()
const jsonParser = express.json()

listingRouter
    .route('/')
    .get((req,res,next)=>{
        ListingsService.getAllListings(req.app.get('db'))
            .then(listings=>{
                res.json(listings)
            })
            .catch(next)
    })
    
listingRouter
    .route('/:user_id')
    .get((req,res,next)=>{
        ListingsService.getListingById(
            req.app.get('db'), 
            req.params.user_id
        )
            .then(listing=>{
                res.json(listing)
            })
            .catch(next)
    })

module.exports = listingRouter;