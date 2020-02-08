const app = require('../src/app')
const knex = require('knex')
const helpers = require('./test-helpers')
const { testUsers } = helpers.makeThingsFixtures()

describe('Images Endpoints',()=>{
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
    describe('GET /api/images/',()=>{
        context('given populated database',()=>{
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
                                                const testImages = helpers.makeImageArray(listings)
                                                return db
                                                    .into('tennit_images')
                                                    .insert(testImages)
                                            })
                                    })
                            })
                    })
            })
            it('returns the image object and a 200',()=>{
                return supertest(app)
                    .get('/api/images/1')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200)
                    .expect(res=>{
                        expect(res.body.user_id).to.eql(1)
                        expect(res.body).to.have.property('image')
                        expect(res.body).to.have.property('date_modified')
                    })
            })
            it('returns a 404 & error code when given a bad user_id',()=>{
                return supertest(app)
                    .get('/api/images/69')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404)
                    .expect(res=>{
                        expect(res.body).to.eql({
                            error: {message: `Image not found.`}
                        })
                    })
            })
            it('returns a 400 & error when given no params',()=>{
                return supertest(app)
                    .get('/api/images/')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(400)
                    .expect(res=>{
                        expect(res.body).to.eql({
                            error: {
                                message: "No user_id provided in params."
                            }
                        })
                    })
            })
        })
    })
    describe('POST /api/images',()=>{
        context('given a populated database',()=>{
            beforeEach('insert the users, listings, ',()=>{
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
                            })
                    })
            })
            it('inserts image into db',()=> {
                const newImage = {
                    image: 'https://loremflickr.com/500/500/landscape?random=1',
                    user_id: 1,
                }
                return supertest(app)
                    .post('/api/images')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newImage)
                    .expect(201)
                    .then(()=>{
                        return supertest(app)
                            .get('/api/images/1')
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(res=>{
                                expect(res.body.image).to.eql(newImage.image)
                            })
                            
                    })
            })
            it('gives a 400 & error code if URL is invalid format',()=> {
                const newImage = {
                    image: 'picture.png',
                    user_id: 1,
                    date_modified: new Date(),
                }
                return supertest(app)
                    .post('/api/images')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newImage)
                    .expect(400)
                    .expect(res=>{
                        expect(res.body).to.eql({ error: { message: `Invalid image URL.` } })
                    })
                   
            })
            const requiredFields = ['image', 'user_id']
            requiredFields.forEach(field=>{
                const newImage = {
                    image: 'https://loremflickr.com/500/500/landscape?random=1',
                    user_id: 1,
                }
                it(`gives a 400 & error code if ${field} is missing`,()=> {
                    delete newImage[field]
                    return supertest(app)
                        .post('/api/images')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(newImage)
                        .expect(400)
                        .expect(res=>{
                            expect(res.body).to.eql({
                                error: { message: `Missing '${field}' in request body` }
                              })
                        })
                })
            })
            it('gives a 400 & error code is user_id is taken',()=>{
                const newImage = {
                    image: 'https://loremflickr.com/500/500/landscape?random=1',
                    user_id: 1,
                    date_modified: new Date(),
                }
                return db
                    .into('tennit_images')
                    .insert(newImage)
                    .then(()=>
                        supertest(app)
                            .post('/api/images')
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .send(newImage)
                            .expect(400)
                            .expect(res=>{
                                expect(res.body).to.eql({
                                    error:{message: 'User already has image'}
                                })
                            })
                    )
            })
        })
    })
    describe('PATCH /api/images/',()=>{
        context('given populated database',()=>{
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
                                                const testImages = helpers.makeImageArray(listings)
                                                return db
                                                    .into('tennit_images')
                                                    .insert(testImages)
                                            })
                                    })
                            })
                    })
            })
            it('should update the correct object based on user_id',()=>{
                const newFields = {
                    image: 'https://loremflickr.com/500/500/landscape?random=5',
                    user_id: 1
                }
                return supertest(app)
                    .patch(`/api/images/1`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newFields)
                    .expect(200)
                    .expect(res=>{
                        expect(res.body.image).to.eql(newFields.image)
                    })
                    .then(()=>{
                        return supertest(app)
                            .get('/api/images/1')
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(res=>{
                                expect(res.body.image).to.eql(newFields.image)
                            })
                    })
            })
            it('returns the correct error code if no fields are given',()=>{
                return supertest(app)
                    .patch('/api/images/1')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({})
                    .expect(400)
                    .expect(res=>{
                        expect(res.body).to.eql({
                            error: {message: 'Request body must supply a correct field.'}
                        })
                    })
            })
            it('returns the correct error code if a bad URL is supplied',()=>{
                return supertest(app)
                    .patch('/api/images/1')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({image: 'hasd'})
                    .expect(400)
                    .expect(res=>{
                        expect(res.body).to.eql({ error: { message: `Invalid image URL.` } })
                    })
            })
        })
    })
})