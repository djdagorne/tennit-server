const app = require('../src/app')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const knex = require('knex')
const helpers = require('./test-helpers')
const { testUsers, testListings } = helpers.makeThingsFixtures()

describe('Auth Endpoints', function() {
    let db 
    beforeEach('make knex instance',()=>{
        db = knex({
            client: 'pg',
            connection: process.env.REACT_APP_TEST_DATABASE_URL,
        })
        app.set('db', db)
    })
    beforeEach('clean the tables', () => db.raw('TRUNCATE tennit_users RESTART IDENTITY CASCADE'))
    afterEach('clean the tables',()=> db.raw('TRUNCATE tennit_users RESTART IDENTITY CASCADE'))
    afterEach('disconnect from db',()=> db.destroy())
    
    describe('POST /api/auth/login',()=>{
        beforeEach('insert users',()=>{
            helpers.seedUsers(
                db,
                testUsers
            )            
        })
        const requiredFields = ['email','password']
        requiredFields.forEach(field => {
            const loginAttemptBody = {
                email: testUsers[0].email,
                password: testUsers[0].password
            }
            it(`responds with 400 and an error when '${field}' is missing`,()=>{
                delete loginAttemptBody[field]

                return supertest(app)
                    .post('/api/auth/login')
                    .send(loginAttemptBody)
                    .expect(400)
            })
        })
        it(`responds 400 'invalid email or password' when bad email`, ()=>{
            const userInvalidUser = { email: 'nope', password:'alsono'}
            return supertest(app)
                .post(`/api/auth/login`)
                .send(userInvalidUser)
                .expect(400, {
                    error: {message: 'Incorrect username or password.'}
                })
        })
        it(`responds 400 'invalid email or password' when bad email`, ()=>{
            const userInvalidUser = { email: 'john@email.com', password:'AAaa11@@'}
            return supertest(app)
                .post(`/api/auth/login`)
                .send(userInvalidUser)
                .expect(400, {
                    error: {message: 'Incorrect username or password.'}
                })
        })
        it('responds 200 and with JWT auth token using secret when creds are valid',()=>{
            const validCreds = {
                email: testUsers[0].email,
                password: testUsers[0].password
            }
            const expectedToken = jwt.sign( 
                {id: 1}, //payload of the JWT
                process.env.JWT_SECRET,
                {
                    subject: testUsers[0].email,
                    algorithm: 'HS256',
                    expiresIn: process.env.JWT_EXPIRY
                }
            )
            return supertest(app)
                .post('/api/auth/login')
                .send(validCreds)
                .expect(200, {
                    authToken: expectedToken
                })

        })
    })
    describe('POST /api/auth/refresh',()=>{
        beforeEach('insert users',()=>{
            helpers.seedUsers(
                db,
                testUsers
            )            
        })

        it('responds 200 and JWT auth token using secret',()=>{
            const expectedToken = jwt.sign( 
                {id: 1},
                process.env.JWT_SECRET,
                {
                    subject: testUsers[0].email,
                    algorithm: 'HS256',
                    expiresIn: process.env.JWT_EXPIRY
                }
            )
            return supertest(app)
                .post('/api/auth/refresh')
                .set('Authorization', helpers.makeAuthHeader({
                    id: 1,
                    email: testUsers[0].email,
                    password: bcrypt.hash(testUsers[0].password, 1) //hash
                }))
                .expect(200, {
                    authToken: expectedToken
                })
        })
    })
}) 