const app = require('../src/app')
const knex = require('knex')
const helpers = require('./test-helpers')
const { testUsers, testListings } = helpers.makeThingsFixtures()
const {maliciousListing, expectedListing} = helpers.makeMaliciousListing(testUsers)

describe('Listings Endpoints', function() {
    let db 
    before('make knex instance',()=>{
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
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
                    .then(()=>
                        supertest(app)
                            .get('/api/users')
                            .then(userRes=>{
                                const testListings = helpers.makeListingArray(userRes.body)
                                return db
                                    .into('tennit_listings')
                                    .insert(testListings)
                            })
                    )
            })
            it('GET /api/listings responds with 200 and all the listings',()=>{
                return supertest(app)
                    .get('/api/listings/')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0]).to.have.property('user_id')
                        expect(res.body[0].firstname).to.have.eql(testListings[0].firstname)
                    })
            })
            it(`GET /api/listings/:user_id reponds 200 and gives object w/ correct id's`,()=>{
                return supertest(app)
                    .get('/api/listings/1')
                    .expect(200)
                    .expect(res=>{
                        expect(res.body).to.have.property('user_id')
                        expect(res.body.firstname).to.eql(testListings[0].firstname)
                    })
                        .then(res => {
                            const sampleListing = res.body
                            return supertest(app)
                                .get('/api/users/1')
                                .expect(res => {
                                    expect(res.body.id).to.eql(sampleListing.user_id)
                                })
                        })
            })
            it('GET /api/listings/ can find listings by province, city, and rent',()=>{
                return supertest(app)
                    .get('/api/listings/')
                    .query({rent: 1500})
                    .expect(200)
                    .expect(res=>{
                        expect(res.body[0].rent).to.eql(1500)
                    })
            })
            it('GET /api/listings/ returns an error when search finds no matches',()=>{
                return supertest(app)
                    .get('/api/listings/')
                    .query({city: 'zzzzzzzzz'})
                    .expect(200)
                    .expect(res=>{
                        expect(res.body).to.eql({error: {message: 'Search returned empty.'}})
                    })
            })
        })
        context('Given no users in the database',()=>{
            it('GET /api/listings responds with an empty array',()=>{
                return supertest(app)
                    .get('/api/listings/')
                    .expect(200)
                    .expect(res=>{
                        expect(res.body).to.eql([])
                    })
            })
            it('GET /api/listings/:user_id responds with an error',()=>{
                return supertest(app)
                    .get('/api/listings/1')
                    .expect(404)
                    .expect(res=>{
                        expect(res.body).to.eql({ error: { message: `Listing doesn't exist.`}})
                    })
            })
        })
    })
    describe('DELETE /api/listings/:user_id',()=>{
        context('given the database has info',()=>{
            beforeEach('insert the users and listings and images',()=>{
                return db
                    .into('tennit_users')
                    .insert(testUsers)
                    .then(()=>
                        supertest(app)
                            .get('/api/users')
                            .then(res=>{
                                const testListings = helpers.makeListingArray(res.body)
                                return db
                                    .into('tennit_listings')
                                    .insert(testListings)
                            })
                    )
            })
        })
    })
    describe('PATCH /api/listings/:user_id',()=>{
        context('given there are users in the database',()=>{
            beforeEach('populate the tables',()=>{
                return db
                    .into('tennit_users')
                    .insert(testUsers)
                    .then(()=>
                        supertest(app)
                            .get('/api/users')
                            .then(userRes=>{
                                const testListings = helpers.makeListingArray(userRes.body)
                                return db
                                    .into('tennit_listings')
                                    .insert(testListings)
                            })
                    )
            })
            it('responds 204 and updates the correct field',()=>{
                const newFields = {
                    neighborhood: 'Updated',
                    rent: 700,
                }
                return supertest(app)
                    .patch(`/api/listings/3`)
                    .send(newFields)
                    .expect(204)
                    .then(()=>{
                        return supertest(app)
                            .get(`/api/listings/3`)
                            .expect(res=>{
                                expect(res.body.rent).to.eql(700)
                                expect(res.body.neighborhood).to.eql('Updated')
                            })
                    })
            })
            it('responds 400 when no required fields are supplied',()=>{
                return supertest(app)
                    .patch(`/api/listings/1`)
                    .send({ding: 'dong'})
                    .expect(400, {
                        error: {message: 'Request body must supply a correct field.'}
                    })
            })
            it('filters out unrelated fields and updates the correct user info, responds 204',()=>{
                return supertest(app)
                    .patch(`/api/listings/1`)
                    .send({ding: 'dong', rent: 777})
                    .expect(204)
                    .then(()=>
                        supertest(app)
                            .get('/api/listings/1')
                            .expect(res=>
                                expect(res.body.rent).to.eql(777)
                        )
                    )
            })
        })
    })
}) 