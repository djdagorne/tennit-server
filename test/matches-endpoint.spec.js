const app = require('../src/app')
const knex = require('knex')
const helpers = require('./test-helpers')
const { testUsers } = helpers.makeThingsFixtures()

describe('Matches Endpoints', function() {
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
    
    beforeEach('insert the users, listings and matches',()=>{
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
                            .then(()=>{
                                supertest(app)
                                    .get('/api/listings')
                                    .then(res=>{
                                        const testMatches = helpers.makeMatchArray(res.body)
                                        return db
                                            .into('tennit_matches')
                                            .insert(testMatches)
                                    })
                            })
                    })
            )
    })
    describe.only('GET /api/matches/',()=>{
        it('given a user_id, it finds all matches associated with that user',()=>{
            return supertest(app)
                .get('/api/matches')
                .send({user_id:1})
                .expect(200)
        })
    })
}) 