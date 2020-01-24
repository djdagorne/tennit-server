const app = require('../src/app')
const knex = require('knex')
const helpers = require('./test-helpers')
const { testUsers, testListings } = helpers.makeThingsFixtures()
const {maliciousListing, expectedListing} = helpers.makeMaliciousListing(testUsers)

describe.only('Listings Endpoints', function() {
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
            beforeEach('insert the users and listings',()=>{
                return db
                    .into('tennit_users')
                    .insert(testUsers)
                    .then(()=>
                        supertest(app)
                            .get('/api/users')
                            .then(res=>{
                                const testListingsResponse = helpers.makeListingArray(res.body)
                                return db
                                    .into('tennit_listings')
                                    .insert(testListingsResponse)
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
            it('GET /api/listings/:user_id reponds 200 and gives a single listing',()=>{
                return supertest(app)
                    .get('/api/listings/1')
                    .expect(200)
                    .expect(res=>{
                        expect(res.body).to.have.property('user_id')
                        expect(res.body.firstname).to.eql(testListings[0].firstname)
                    })
            })
        })
        context('Given no users in the database',()=>{

        })
    })
}) 