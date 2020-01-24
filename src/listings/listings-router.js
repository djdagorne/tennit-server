const express = require('express')
const ListingsService = require('./listings-service')
const helpers = require('../../test/test-helpers')
const listingRouter = express.Router()
const jsonParser = express.json()

listingRouter
    .route('/')
    .get((req,res,next)=>{
        ListingsService.getAllListings(req.app.get('db'))
            .then(allListings=>{
                const {province, city, neighborhood, rent} = req.query
                if(province || city || neighborhood || rent){
                    ListingsService.getSearchResults(
                        allListings,
                        province,
                        city,
                        neighborhood,
                        rent
                    )
                    .then(searchResults=> //why is this not a function!?!?
                        res.json(searchResults)
                    )
                }
                res.json(allListings)
            })
            .catch(next)
    })
    
listingRouter
    .route('/:user_id')
    .all((req,res,next)=>{
        ListingsService.getListingById(
            req.app.get('db'), 
            req.params.user_id
        )
            .then(listing=>{
                if(!listing){
                    return res.status(404).json({ error: { message: `Listing doesn't exist.`}})
                }
                res.listing = listing;
                next()
            })
            .catch(next)
    })
    .get((req,res,next)=>{
        res.json(res.listing)
    })
    .delete((req,res,next)=>{
        ListingsService.deleteListing(
            req.app.get('db'),
            req.params.user_id
        )
            .then(()=>{
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = listingRouter;