const app = require('../src/app')
const knex = require('knex')
const helpers = require('./test-helpers')
const { testUsers, testListings } = helpers.makeThingsFixtures()

describe('Listings Endpoints', function() {
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
    
    describe('GET /api/listing',()=>{
        context('Given there are listings in the database',()=>{
            beforeEach('populate the tables',()=>{
                return db
                    .into('tennit_users')
                    .insert(testUsers)
                    .then(()=>{
                        return db
                            .select('*')
                            .from('tennit_users')
                            .then(userRes=>{
                                const testListings = helpers.makeListingArray(userRes)
                                return db
                                    .into('tennit_listings')
                                    .insert(testListings)
                            })
                    })
            })
            it('GET /api/listings responds with a 400 if no query made',()=>{
                return supertest(app)
                    .get('/api/listings/')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(400)
                    .expect(res => {
                        expect(res.body).to.eql({
                            error: {message: 'No valid query entered.'}
                        })
                    })
            })
            it(`GET /api/listings/:user_id reponds 200 and gives object w/ correct id's`,()=>{
                return supertest(app)
                    .get('/api/listings/1')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200)
                    .expect(res=>{
                        expect(res.body).to.have.property('user_id')
                        expect(res.body.firstname).to.eql(testListings[0].firstname)
                    })
                        .then(res => {
                            const sampleListing = res.body
                            return supertest(app)
                                .get('/api/users/1')
                                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                                .expect(res => {
                                    expect(res.body.id).to.eql(sampleListing.user_id)
                                })
                        })
            })
            it('GET /api/listings/ can find listings by province, city, and rent',()=>{
                return supertest(app)
                    .get('/api/listings/')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .query({rent: 800})
                    .expect(200)
                    .expect(res=>{
                        expect(res.body[0].rent).to.eql(700)
                    })
            })
            it('GET /api/listings/ returns an error when search finds no matches',()=>{
                return supertest(app)
                    .get('/api/listings/')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .query({city: 'zzzzzzzzz'})
                    .expect(200)
                    .expect(res=>{
                        expect(res.body).to.eql({error: {message: 'Search returned empty.'}})
                    })
            })
        })
        context('given an xss attack listing',()=>{
            beforeEach('insert the users and malicious listing',()=>{
                return db
                    .into('tennit_users')
                    .insert(testUsers)
                    .then(()=>{
                        return db
                            .select('*')
                            .from('tennit_users')
                            .then(users=>{
                                const {maliciousListing} = helpers.makeMaliciousListing(users)
                                return db
                                    .into('tennit_listings')
                                    .insert(maliciousListing)
                            })
                    })
            })
            it(`responds with 200 and santizes the content`,() => {
                const {expectedListing} = helpers.makeMaliciousListing(testUsers)
                return supertest(app)
                    .get('/api/listings/1')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200)
                    .expect(res=>{
                        expect(res.body.listing).to.eql(expectedListing.listing)
                        expect(res.body.firstname).to.eql(expectedListing.firstname)
                    })

            })
        })
    })
    describe('POST /api/listing',()=>{
        context('given users in the db',()=>{
            beforeEach('insert the users and malicious listing',()=>{
                return db
                    .into('tennit_users')
                    .insert(testUsers)
            })
            it('POSTs the listing and returns the listing object',()=>{
                return db
                    .select('*')
                    .from('tennit_users')
                    .then(users=>{
                        const testListings = helpers.makeListingArray(users)
                        const testListing = testListings[0] 
                        return supertest(app)
                            .post('/api/listings/')
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .send(testListing)         
                            .expect(res=>{
                                expect(res.body).to.eql(testListing)
                            })
                    })
            })
            it('returns an error when there is no supplied listing',()=>{
                return supertest(app)
                    .post('/api/listings/')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({})
                    .expect(res=>{
                        expect(res.body).to.eql({
                            error: {message: 'Request body must supply a listing object.'}
                        })
                    })
            })
            it('sanitizes listings on the way into the db',()=>{
                return db
                    .select('*')
                    .from('tennit_users')
                    .then(users=>{
                        const {maliciousListing, expectedListing} = helpers.makeMaliciousListing(users)
                        return supertest(app)
                            .post('/api/listings/')
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .send(maliciousListing)
                            .expect(res=>{
                                expect(res.body).to.eql(expectedListing)
                            })
                    })
            })
            const baseKeys = ['user_id','firstname','lastname','usergender','prefgender','age','province','city','userblurb','listing']
            baseKeys.forEach(field=>{
                const testListings = helpers.makeListingArray(testUsers)
                const newListing = {
                    ...testListings[0],
                    user_id: 1, 
                }
                it(`returns an error code if a required '${field}' field is not found`,()=>{
                    delete newListing[field]
                    return supertest(app)
                        .post('/api/listings/')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(newListing)
                        .expect(400)
                        .expect(res=>{
                            expect(res.body).to.eql({
                                error: { message: `Missing '${field}' in request body.`}
                            })
                        })
                })
            })
            const listingKeys = ['rent','blurb']
            listingKeys.forEach(field =>{
                const testListings = helpers.makeListingArray(testUsers)
                const newListing = {
                    ...testListings[0],
                    user_id: 1, 
                }
                it(`returns an error code if 'listing' is true but ${field} is empty`,()=>{
                    delete newListing[field]
                    return supertest(app)
                        .post('/api/listings/')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(newListing)
                        .expect(400)
                        .expect(res=>{
                            expect(res.body).to.eql({
                                error: { message: `Missing '${field}' in request body.`}
                            })
                        })
                })
            })
            listingKeys.forEach(field =>{
                const testListings = helpers.makeListingArray(testUsers)
                const newListing = {
                    ...testListings[3],
                    user_id: 4, 
                }
                it(`returns a 201 if 'listing' is false but ${field} is empty`,()=>{
                    delete newListing[field]
                    return supertest(app)
                        .post('/api/listings/')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(newListing)
                        .expect(201)
                        .expect(res=>{
                            expect(res.body.user_id).to.eql(newListing.user_id)
                            expect(res.body.listing).to.eql(newListing.listing)
                        })
                })
            })
        })
    })
    describe('PATCH /api/listings/:user_id',()=>{
        context('given there are users in the database',()=>{
            beforeEach('populate the tables',()=>{
                return db
                    .into('tennit_users')
                    .insert(testUsers)
                    .then(()=>{
                        return db
                            .select('*')
                            .from('tennit_users')
                            .then(userRes=>{
                                const testListings = helpers.makeListingArray(userRes)
                                return db
                                    .into('tennit_listings')
                                    .insert(testListings)
                            })
                    })
            })
            it('responds 204 and updates the correct field',()=>{
                const newFields = {
                    neighborhood: 'Updated',
                    rent: 700,
                }
                return supertest(app)
                    .patch(`/api/listings/3`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
                    .send(newFields)
                    .expect(200)
                    .then(()=>{
                        return supertest(app)
                            .get(`/api/listings/3`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
                            .expect(res=>{
                                expect(res.body.rent).to.eql(700)
                                expect(res.body.neighborhood).to.eql('Updated')
                            })
                    })
            })
            it('responds 400 when no required fields are supplied',()=>{
                return supertest(app)
                    .patch(`/api/listings/1`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({ding: 'dong'})
                    .expect(400, {
                        error: {message: 'Request body must supply a correct field.'}
                    })
            })
            it('filters out unrelated fields and updates the correct user info, responds 204',()=>{
                return supertest(app)
                    .patch(`/api/listings/1`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({ding: 'dong', rent: 777})
                    .expect(200)
                    .then(()=>
                        supertest(app)
                            .get('/api/listings/1')
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(res=>
                                expect(res.body.rent).to.eql(777)
                        )
                    )
            })
        })
    })
}) 