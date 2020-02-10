
const express = require('express')
const UsersService = require('./users-service')
const helpers = require('../../test/test-helpers')
const usersRouter = express.Router()
const jsonParser = express.json()
const {requireAuth} = require('../middleware/jwt-auth')
const AuthService = require('../auth/auth-service')

usersRouter
    .route('/')
    .get((req,res,next)=>{
        const {email} = req.query
        if(email){
            UsersService.getUserByEmail(
                req.app.get('db'),
                email
            )
                .then(user=>{
                    if(user){
                        res.json(user)
                    }
                    else{
                        res.json({
                            error: {message: `User doesn't exist.`}
                        })
                    }
                })
                .catch(next)
        }else{
            UsersService.getAllUsers(req.app.get('db'))
            .then(users=>{
                res.json(users)
            })
            .catch(next)
        }
    })
    .post(jsonParser, (req,res,next)=>{
        const {email, password} = req.body;
        for (const field of ['email', 'password']){
            if(!req.body[field]){
                return res.status(400).json({
                    error: {message: `Missing '${field}' in request body.`}
                })
            }
        }  
        const passwordError = UsersService.validatePassword(password)
        if(passwordError){
            return res.status(400).json({
                error: {message: passwordError}
            })
        }
        UsersService.hasUserWithEmail(
            req.app.get('db'), 
            email
        )
            .then(hasDupeEmail => {
                if(hasDupeEmail){
                    return res.status(400).json({
                        error: { message: `Email already in use.` }
                    })
                }
                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            email,
                            password: hashedPassword
                        }
                        return UsersService.insertNewUser(
                            req.app.get('db'),
                            newUser
                        )
                            .then(user => {
                                const subject = user.email
                                const payload = {id: user.id}
                                res.status(201).send({
                                    authToken: AuthService.createJwt(subject, payload)
                                })
                             })
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
                    return res.status(404).json({
                            error: { message: `User doesn't exist.`}
                        })
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
            return res.status(400).json({
                    error: {message: 'Request body must supply a correct field.'}
                })
        }
    })

module.exports = usersRouter;