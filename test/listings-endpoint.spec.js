const app = require('../src/app')
const knex = require('knex')
const helpers = require('./test-helpers')
const { testUsers } = helpers.makeThingsFixtures()
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
    
    describe('GET /api/users',()=>{
        context('Given there are users in the database',()=>{
            beforeEach('insert the users',()=>{
                return db
                    .into('tennit_users')
                    .insert(testUsers)
                    .then(()=>{
                        return supertest(app)
                            .get('/api/users')
                            .then(res=>{
                                const testListings = helpers.makeListingArray(res.body)
                                console.log(testListings)                                    
                            })
                    })
            })
        })
}) 