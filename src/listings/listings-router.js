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
                    res.json(
                        ListingsService.getSearchResults(
                            allListings,
                            province,
                            city,
                            neighborhood,
                            rent
                        )
                    )
                }else{
                    res.json(allListings)
                }
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
    .patch(jsonParser, (req,res,next)=>{
        const newListingData = req.body;
        const testUsers = helpers.makeUserArray()
        const testListing = helpers.makeListingArray(testUsers);
        const listingKeys = Object.keys(testListing[0])
        //inspect keys of req.body
        for(const [key] of Object.entries(newListingData)){
            //make new array to verify matching keys, deleting keys  newarray.length === 0.
            if(listingKeys.filter(sampleKey => sampleKey === key).length === 0){ 
                delete newListingData[key]
            }
        }
        //assuming any keys passed filtertest, follow happy path
        if(Object.keys(newListingData).length > 0){
            ListingsService.updateListing(
                req.app.get('db'),
                req.params.user_id, 
                newListingData
            )
                .then(rows => {
                    res.status(204).end()
                })
                .catch(next)
        }else{
            return res.status(400).json({
                    error: {message: 'Request body must supply a correct field.'}
                })
        }
    })
module.exports = listingRouter;