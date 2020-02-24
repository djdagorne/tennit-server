const express = require('express')
const helpers = require('../../test/test-helpers')
const ImagesService = require('./images-service')
const imagesRouter = express.Router()
const jsonParser = express.json()
const {requireAuth} = require('../middleware/jwt-auth')


imagesRouter
    .route('/')
    .get(requireAuth, (req,res,next)=>{
        res.status(400).json({
            error: {message: 'No user_id provided in params.'}
        })
    })
    .post(requireAuth, jsonParser,(req,res,next)=>{
        const {image, user_id} = req.body;
        const newImage = {image, user_id};
        for(const [key, value] of Object.entries(newImage)){
            if(value == null){
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                  })
            }
        }
        //TODO check if user_id exists already before insertion
        ImagesService.getImageByUserId(
            req.app.get('db'),
            user_id
        )
            .then(image=>{
                if(image){
                    res.status(400).json({
                        error: {message: 'User already has image'}
                    })
                }else{
                    if(ImagesService.validateUrl(newImage)){
                        ImagesService.insertImage(
                            req.app.get('db'),
                            newImage
                        )
                            .then(newImage=>{
                                res.status(201).json(newImage)
                            })
                            .catch(next)
                    }else{
                        res.status(400).json({ error: { message: `Invalid image URL.` } })
                    }
                }
            })
            .catch(next)
    })

imagesRouter
    .route('/:user_id')
    .all(requireAuth, (req,res,next)=>{
        ImagesService.getImageByUserId(
            req.app.get('db'),
            req.params.user_id
        )
            .then(image=>{
                if(image){
                    res.image = image
                    next()
                }else{
                    res.status(404).json({
                        error: {message: `Image not found.`}
                    })
                }
            })
            .catch(next)
    })
    .get((req,res,next)=>{
        res.json(res.image)
    })
    .patch(jsonParser, (req,res,next)=>{
        const {user_id, image} = req.body;
        const newImage = {user_id, image}
        const requiredFields = ['user_id', 'image']
        requiredFields.forEach(field=>{
            if(!newImage[field]){
                delete newImage[field]
            }
        })
        if(Object.keys(newImage).length > 0){
            if(ImagesService.validateUrl(newImage)){
                ImagesService.updateImage(
                    req.app.get('db'),
                    req.params.user_id,
                    newImage
                )
                    .then(image=>{
                        return res.status(200).send(image)
                    })
                    .catch(next)
            }else{
                res.status(400).json({
                        error: { message: `Invalid image URL.` } 
                    })
            }
        }else{
            res.status(400).json({
                error: {message: 'Request body must supply a correct field.'}
            })
        }
    })

module.exports = imagesRouter;