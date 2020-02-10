const express = require('express');
const authRouter = express.Router()
const jsonParser = express.json();
const AuthService = require('./auth-service')
const { requireAuth } = require('../middleware/jwt-auth')

authRouter
    .post('/login', jsonParser, (req,res,next)=>{
        console.log(req.body)
        const {email, password} = req.body
        const loginUser = {email, password}
        for (const [key, value] of Object.entries(loginUser)){
            if(value == null){
                return res.status(400).json({
                    error: `Missing '${key}' in the request body`
                })
            }
        }
        AuthService.getUserByEmail(
            req.app.get('db'),
            loginUser.email
        )
            .then(user =>{
                console.log(user)
                if(!user){
                    return res.status(400).json({
                        error: {message: 'Incorrect username or password.'}
                    })
                }

                return AuthService.comparePasswords(loginUser.password, user.password)
                    .then(comparison=>{
                        if(!comparison){
                            return res.status(400).json({
                                error: {message: 'Incorrect username or password.'}
                            })
                        }
                        const subject = user.email
                        const payload = {id: user.id}
                        res.send({
                            authToken: AuthService.createJwt(subject, payload)
                        })
                    })
            })
            .catch(next)
    })

authRouter
    .post('/refresh', requireAuth, (req,res)=>{
        const sub = req.user.email
        const payload = {id: req.user.id}
        res.send({
            authToken: AuthService.createJwt(sub, payload)
        })
    })


module.exports = authRouter