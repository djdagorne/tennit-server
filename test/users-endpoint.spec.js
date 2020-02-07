const app = require('../src/app')
const knex = require('knex')
const helpers = require('./test-helpers')
const { testUsers, testListings } = helpers.makeThingsFixtures()
const {maliciousListing, expectedListing} = helpers.makeMaliciousListing(testUsers)

describe('Users Endpoints', function() {
    let db 
    before('make knex instance',()=>{
        db = knex({
            client: 'pg',
            connection: process.env.REACT_APP_TEST_DB_URL,
        })
        app.set('db', db)
    })
    before('clean the tables', () => db.raw('TRUNCATE tennit_users, tennit_listings, tennit_images, tennit_matches, tennit_comments RESTART IDENTITY CASCADE'))
    afterEach('clean the tables',()=> db.raw('TRUNCATE tennit_users, tennit_listings, tennit_images, tennit_matches, tennit_comments RESTART IDENTITY CASCADE'))
    after('disconnect from db',()=> db.destroy())
    
    describe('GET /api/users',()=>{
        context('Given there are users in the database',()=>{
            beforeEach('insert the users',()=>{
                return db
                    .into('tennit_users')
                    .insert(testUsers)
            })
            it('GET /users responds with 200 and all the users',()=>{
                return supertest(app)
                    .get('/api/users/')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].email).to.have.eql(testUsers[0].email)
                    })
            })
        })
        context('Given there are no users in the database',()=>{
            it('responds with 200 and empty array',()=>{
                return supertest(app)
                    .get(`/api/users/`)
                    .expect(200, [])
            })
        })
    })
    describe('GET /api/users/:user_id',()=>{
        context('Given there are users in the database',()=>{
            beforeEach('insert the users',()=>{
                return db
                    .into('tennit_users')
                    .insert(testUsers)
            })
            it('responds with 200 and the user JSON',()=>{
                return supertest(app)
                    .get('/api/users/1')
                    .expect(200)
                    .expect(res => {
                        expect(res.body.email).to.eql(testUsers[0].email)
                        expect(res.body).to.have.property('id')
                    })
            })
        })
        context('Given there are no users in the database',()=>{
            it('responds with 404',()=>{
                return supertest(app)
                    .get(`/api/users/1234566666`)
                    .expect(404, { error: { message: `User doesn't exist.`}})
            })
        })
    }) //TODO hash passwords, get auth working
    describe('POST /api/users/',()=>{
        it('it creates a new user, responds with 201 and the user object',()=>{
            return supertest(app)
                .post('/api/users')
                .send(testUsers[1])
                .expect(201)
                .expect(res=>{
                    expect(res.body.email).to.eql(testUsers[1].email)
                    expect(res.body).to.have.property('id')
                })
        })
        context('given duplicate user emails',()=>{
            beforeEach('insert the users',()=>{
                return db
                    .into('tennit_users')
                    .insert(testUsers)
            })
            it('it responds 400 and gives an error',()=>{
                return supertest(app)
                        .post('/api/users/')
                        .send(testUsers[0])
                        .expect(400, {error: {message: `Email already in use.`}} )
            })
        })
        context('field validation',()=>{
            const requiredFields = ['email', 'password']
            requiredFields.forEach(field => {
                const testUsers = helpers.makeUserArray()
                const newUser = testUsers[0]
                it(`responds with 400 and an error message when the '${field}' is missing`,() => {
                    delete newUser[field]
                    return supertest(app)
                        .post('/api/users')
                        .send(newUser)
                        .expect(400, {
                            error: { message: `Missing '${field}' in request body.`}
                        })
                })
            })
            it(`responds 400 'Password must be longer than 8 characters' when password has fewer than 8 characters`,()=>{
                const userShortPassword = {
                    email: 'test@email.com',
                    password: 'AAa1!',
                }
                return supertest(app)
                    .post('/api/users')
                    .send(userShortPassword)
                    .expect(400, {error: {message: 'Password must be at least 8 characters'}})
            })

            it(`responds 400 'Password must be 72 characters or fewer' when password is more than 72 characters`,()=>{
                const userLongPassword = {
                    email: 'test@email.com',
                    password: '*'.repeat(73)
                }
                return supertest(app)
                    .post('/api/users')
                    .send(userLongPassword)
                    .expect(400, {
                        error: {message: 'Password must be 72 characters or fewer'}
                    })
            })
            it(`responds 400 when password starts with a space`,()=>{
                const userPasswordStartsSpace = {
                    email: 'test@email.com',
                    password: ' 11AAaa!!'
                }
                return supertest(app)
                    .post('/api/users')
                    .send(userPasswordStartsSpace)
                    .expect(400, {
                        error: {message: 'Password must not start or end with spaces'}
                    })
            })
            it(`responds 400 when password ends with a space`,()=>{
                const userPasswordStartsSpace = {
                    email: 'test@email.com',
                    password: '11AAaa!! '
                }
                return supertest(app)
                    .post('/api/users')
                    .send(userPasswordStartsSpace)
                    .expect(400, {
                        error: {message: 'Password must not start or end with spaces'}
                    })
            })
            it(`responds 400 when password is not complex enough`,()=>{
                const userEasyPassword = {
                    email: 'test@email.com',
                    password: 'aaaaaaaa'
                }
                return supertest(app)
                    .post('/api/users')
                    .send(userEasyPassword)
                    .expect(400, {
                        error: {message: `Password must contain 1 upper case, lower case, number and special character`}
                    })
            })
        })
    })
    describe('DELETE /api/users/:user_id',()=>{
        context('given there are users in the database',()=>{
            beforeEach('insert the users, listings, images, matches and comments',()=>{
                return db
                    .into('tennit_users')
                    .insert(testUsers)
                    .then(()=>{
                        return db
                            .select('*')
                            .from('tennit_users')
                            .then(users=>{
                                const testListings = helpers.makeListingArray(users)
                                return db
                                    .into('tennit_listings')
                                    .insert(testListings)
                                    .then(()=>{
                                        return db
                                            .select('*')
                                            .from('tennit_listings')
                                            .then(listings=>{
                                                const testMatches = helpers.makeMatchArray(listings)
                                                const testImages = helpers.makeImageArray(listings)
                                                return db
                                                    .into('tennit_matches')
                                                    .insert(testMatches)
                                                    .then(()=>{
                                                        return db
                                                            .select('*')
                                                            .from('tennit_matches')
                                                            .then(matches=>{
                                                                const testComments = helpers.makeCommentArray(matches)
                                                                return db
                                                                    .into('tennit_comments')
                                                                    .insert(testComments)
                                                                    
                                                            })
                                                    })
                                                    .then(()=>{
                                                        return db
                                                            .into('tennit_images')
                                                            .insert(testImages)
                                                    })
                                            })
                                    })
                            })
                    })
            })
            it('responds with 204 and successfully removes user',()=>{
                const expectedUsers = testUsers.slice(1)
                return supertest(app)
                    .delete('/api/users/1')
                    .expect(204)
                    .then(()=>
                        supertest(app)
                            .get(`/api/users/`)
                            .expect(200)
                            .expect(res=>{
                                expect(res.body[0].id).to.eql(2)
                                expect(res.body.length).to.eql(expectedUsers.length)
                            })
                    )
            })
            it('responds 204 removes the associated listings as well',()=>{
                return supertest(app)
                    .delete('/api/users/1')
                    .then(()=>
                        supertest(app)
                            .get('/api/listings/1')
                            .expect(404)
                            .expect(res=>{
                                expect(res.body).to.eql({ error: { message: `Listing doesn't exist.`}})
                            })
                    )
            })
            it('responds 204 and removes associated matches as well',()=>{
                return supertest(app)
                    .delete('/api/users/1')
                    .then(()=>
                        supertest(app)
                            .get('/api/matches/?user_id=1')
                            .expect(404)
                            .expect(res=>{
                                expect(res.body).to.eql({
                                    error: {message: `No match found.`}
                                })
                            })
                    )
            })
            it('responds 204 and removes associated comments as well',()=>{
                return supertest(app)
                    .delete('/api/users/2')
                    .then(()=>{
                        return db
                            .select('*')
                            .from('tennit_comments')
                            .then(comments=>{
                                comments.map(comment=>{
                                    expect(comment.user_id).to.not.eql(2)
                                })
                            })
                    })
            })
            it('responds 204 and removes associated images as well',()=>{
                return supertest(app)
                    .delete('/api/users/1')
                    .then(()=>{
                        return db
                            .select('*')
                            .from('tennit_images')
                            .then(images=>{
                                images.map(image=>{
                                    expect(image.user_id).to.not.eql(1)
                                })
                            })
                    })
            })
        })
        context('given an empty database',()=>{
            it('responds with 404',()=>{
                return supertest(app)
                    .delete(`/api/users/1`)
                    .expect(404, { error: { message: `User doesn't exist.`}})
            })
        })
    })
}) 