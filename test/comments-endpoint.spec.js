const app = require('../src/app')
const knex = require('knex')
const helpers = require('./test-helpers')
const { testUsers } = helpers.makeThingsFixtures()

describe('Comments Endpoints',()=> {
    let db 
    before('make knex instance',()=>{
        db = knex({
            client: 'pg',
            connection: process.env.REACT_APP_TEST_DATABASE_URL,
        })
        app.set('db', db)
    })
    before('clean the tables', () => db.raw('TRUNCATE tennit_users, tennit_listings, tennit_images, tennit_matches, tennit_comments RESTART IDENTITY CASCADE'))
    afterEach('clean the tables',()=> db.raw('TRUNCATE tennit_users, tennit_listings, tennit_images, tennit_matches, tennit_comments RESTART IDENTITY CASCADE'))
    after('disconnect from db',()=> db.destroy())

    describe('GET /api/comments/:match_id',()=>{
        context('given comments in the database',()=>{
            beforeEach('insert the users, listings and matches',()=>{
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
                                            })
                                    })
                            })
                    })
            })
            it('returns an empty array with a 200 when no comments exist, but match exists',()=>{
                return supertest(app)
                    .get('/api/comments/5')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200)
                    .expect(res=>{
                        expect(res.body).to.eql([])
                    })
            })
            it('it returns all comments associated with the correct match_id',()=>{
                return supertest(app)
                    .get('/api/comments/1')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200)
                    .expect(res=>{
                        expect(res.body.length).to.eql(4)
                        expect(res.body[0].match_id).to.eql(1)
                    })
            })
            it('it returns the correct error code when given a match_id that doesnt exist',()=>{
                return supertest(app)
                    .get('/api/comments/555555555')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404)
                    .expect(res=>{
                        expect(res.body).to.eql({
                            error: {message: 'Match_id not found.'}
                        })
                    })
            })
            it('it returns the correct error code when not given a match_id',()=>{
                return supertest(app)
                    .get('/api/comments/')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(400)
                    .expect(res=>{
                        expect(res.body).to.eql({
                            error: {message: 'No match_id provided in params.'}
                        })
                    })
            })
        })
    })
    describe('POST /api/comments',()=>{
        context('given content in the database',()=>{
            beforeEach('insert the users, listings and matches',()=>{
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
                                            })
                                    })
                            })
                    })
            })
            it('posts a new comment, returns a 201 and returns the new comment list for the match_id',()=>{
                const newComment = {
                    match_id: 1,
                    user_id: 1,
                    comment: 'test123'
                }
                return supertest(app)
                    .post('/api/comments')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newComment)
                    .expect(201)
                    .expect(res=>{
                        expect(res.body[0].match_id).to.eql(newComment.match_id)
                        expect(res.body[0].user_id).to.eql(newComment.user_id)
                    })
            })
            const requiredFields = ['match_id','user_id','comment']
            requiredFields.forEach(field => {
                const newComment = {
                    match_id: 1,
                    user_id: 1,
                    comment: 'test123'
                }
                it(`returns an error code if a required ${field} is not found`,()=>{
                    delete newComment[field]
                    return supertest(app)
                        .post('/api/comments')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(newComment)
                        .expect(400)
                        .expect(res=>{
                            expect(res.body).to.eql({
                                error: { message: `Missing '${field}' in request body` }
                            })
                        })
                })
            })
            it('returns an error when a different user_id from the matchs users tries to post',()=>{
                const newComment = {
                    match_id: 1,
                    user_id: 3,
                    comment: 'test123'
                }
                return supertest(app)
                    .post('/api/comments')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newComment)
                    .expect(400)
                    .expect(res=>{
                        expect(res.body).to.eql({
                            error: {message: 'User is not part of this match.'}
                        })
                    })
            })
        })
    })
}) 