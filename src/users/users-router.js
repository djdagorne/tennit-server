
const express = require('express')
const UsersService = require('./users-service')
const helpers = require('../../test/test-helpers')
const usersRouter = express.Router()
const jsonParser = express.json()

usersRouter
    .route('/')
    .get((req,res,next)=>{
        UsersService.getAllUsers(req.app.get('db'))
            .then(users=>{
                res.json(users)
            })
            .catch(next)
    })
    .post(jsonParser, (req,res,next)=>{
        const newUser = req.body;
        for(const [key, value] of Object.entries(newUser)){
            if(value == null){
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body.`}
                })
            }
        }
        UsersService.hasUserWithEmail(
            req.app.get('db'), 
            newUser.email
        )
            .then(hasDupeEmail => {
                if(hasDupeEmail){
                    return res.status(400).json({error: { message: `Email already in use.` }})
                }
                return UsersService.insertNewUser(
                    req.app.get('db'),
                    newUser
                )
                    .then(user => {
                        res
                            .status(201)
                            .location(`/`)
                            .json(user)
                    })
                    
            })
            .catch(next)
    })

usersRouter
    .route('/:user_id')
    .all((req,res,next)=>{
        UsersService.getUserById(
            req.app.get('db'),
            req.params.user_id
        )
            .then(user =>{
                if(!user){
                    return res.status(404).json({ error: { message: `User doesn't exist.`}})
                }
                res.user = user; //creating user object in the response
                next()
            })
            .catch(next)
    })
    .get((req,res,next)=>{
        res.json(res.user)
    })
    .delete((req,res,next)=>{
        UsersService.deleteUser(
            req.app.get('db'),
            req.params.user_id
        )
            .then(()=>{
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req,res,next)=>{
        const newUserData = req.body;
        const testUsers = helpers.makeUserArray()
        const userKeys = Object.keys(testUsers[0])
        for(const [key] of Object.entries(newUserData)){
            if(userKeys.filter(sampleKey => sampleKey === key).length === 0){ //if each key of nUD doesnt match any of the testUser keys, delete the key from nUD
                delete newUserData[key]
            }
        }
        if(Object.keys(newUserData).length > 0){//after being pruned if nUD is empty, throw the error, or continue as usual
            UsersService.updateUser(
                req.app.get('db'),
                req.params.user_id, 
                newUserData
            )
                .then(rows => {
                    res.status(204).end()
                })
                .catch(next)
        }else{
            return res.status(400).json({ error: {message: 'Request body must supply a correct field.'}})
        }
    })

module.exports = usersRouter;