const express = require('express')
const ListingsService = require('./listings-service')
const helpers = require('../../test/test-helpers')
const listingRouter = express.Router()
const jsonParser = express.json()
const {requireAuth} = require('../middleware/jwt-auth')

listingRouter
    .route('/')
    .get(requireAuth, (req,res,next)=>{
        ListingsService.getAllListings(req.app.get('db'))
            .then(allListings=>{
                const {province, city, rent} = req.query
                if(province || city ||  rent){
                    res.json(
                        ListingsService.getSearchResults(
                            allListings,
                            province,
                            city,
                            rent
                        )
                    )
                }else{
                    res.status(400).json({
                        error: {message: 'No valid query entered.'}
                    })
                }
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req,res,next)=>{
        const baseKeys = ['user_id','firstname','lastname','usergender','prefgender','age','province','city','listing','userblurb']
        const listingKeys = ['rent','blurb']
        const newListing = req.body
        if(Object.keys(newListing).length > 0){
            for(const field of baseKeys){
                if(newListing[field] == null){
                    return res.status(400).json({
                        error: { message: `Missing '${field}' in request body.`}
                    })
                }
                if(newListing.listing === true){
                    for(const field of listingKeys){
                        if(newListing[field] == null){
                            return res.status(400).json({
                                error: { message: `Missing '${field}' in request body.`}
                            })
                        }
                    }
                }
            }
            ListingsService.insertNewListing(
                req.app.get('db'),
                ListingsService.serializeListing(newListing)
            )
                .then(listing=>{
                    res.status(201).json(listing)
                })
            
        }else{
            res.status(400).json({
                error: {message: 'Request body must supply a listing object.'}
            })
        }
    })
    
listingRouter
    .route('/:user_id')
    .all(requireAuth, (req,res,next)=>{
        ListingsService.getListingById(
            req.app.get('db'), 
            req.params.user_id
        )
            .then(listing=>{
                if(!listing){
                    return res.status(404).json({ error: { message: `Listing doesn't exist.`}})
                }
                res.listing = ListingsService.serializeListing(listing)
                next()
            })
            .catch(next)
    })
    .get((req,res,next)=>{
        res.json(res.listing)
    })
    .patch(jsonParser, (req,res,next)=>{
        const newListingData = req.body
        const testUsers = helpers.makeUserArray()
        const testListing = helpers.makeListingArray(testUsers)
        const listingKeys = Object.keys(testListing[0])
        for(const [key] of Object.entries(newListingData)){
            if(listingKeys.filter(sampleKey => sampleKey === key).length === 0){ 
                delete newListingData[key]
            }
        }
        if(Object.keys(newListingData).length > 0){
            ListingsService.updateListing(
                req.app.get('db'),
                req.params.user_id, 
                newListingData
            )
                .then(rows => {
                    return res.send(rows)
                })
                .catch(next)
        }else{
            return res.status(400).json({
                    error: {message: 'Request body must supply a correct field.'}
                })
        }
    })
module.exports = listingRouter