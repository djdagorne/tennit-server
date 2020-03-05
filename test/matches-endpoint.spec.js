const app = require('../src/app');
const knex = require('knex');
const helpers = require('./test-helpers');
const { testUsers, testMatches } = helpers.makeThingsFixtures();

describe('Matches Endpoints', function(){
    let db;
    before('make knex instance',()=>{
        db = knex({
            client: 'pg',
            connection: process.env.REACT_APP_TEST_DATABASE_URL,
        });
        app.set('db', db);
    })
    before('clean the tables', () => db.raw('TRUNCATE tennit_users, tennit_listings, tennit_images, tennit_matches, tennit_comments RESTART IDENTITY CASCADE'));
    afterEach('clean the tables',()=> db.raw('TRUNCATE tennit_users, tennit_listings, tennit_images, tennit_matches, tennit_comments RESTART IDENTITY CASCADE'));
    after('disconnect from db',()=> db.destroy());
    
    
    describe('GET /api/matches/',()=>{
        context('given there is data in the tables',()=>{
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
                                                    .insert(testMatches);
                                            });
                                    });
                            });
                    });
            });
            it('given a user_id, it finds all matches associated with that user',()=>{
                return supertest(app)
                    .get(`/api/matches/`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .query({user_id:1})
                    .expect(200)
                    .expect(res => 
                        expect(res.body.length).to.eql(3)
                    );
            });
            it('given a wrong user_id in the query, it gives the correct error code',()=>{
                return supertest(app)
                    .get('/api/matches/')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .query({user_id:11111111})
                    .expect(404)
                    .expect(res => 
                        expect(res.body).to.eql({
                            error: {message: `No valid query entered.`}
                        })
                    );
            });
            it('given no user_id in the query, it gives the correct error code',()=>{
                return supertest(app)
                    .get('/api/matches/')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404)
                    .expect(res=>
                        expect(res.body).to.eql({
                            error: {message: `No valid query entered.`}
                        })    
                    );
            });
            it('given an invalid format for the user_id in the query, it gives the correct error code',()=>{
                return supertest(app)
                    .get('/api/matches/')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .query({user_id:'SCOOBYDOO'})
                    .expect(404)
                    .expect(res=>
                        expect(res.body).to.eql({
                            error: {message: `No valid query entered.`}
                        })    
                    );
            });
        })
    })
    describe('GET /api/matches/:match_id',()=>{
        context('given populated database',()=>{
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
                                                    .insert(testMatches);
                                            });
                                    });
                            });
                    });
            });
            it('should return an object with the match details',()=>{
                return supertest(app)
                    .get('/api/matches/1')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200)
                    .expect(res=>{
                        expect(res.body.id).to.eql(1)
                    });
            });
        });
    });
    describe('POST /api/matches/',()=>{
        context('given users and listings',()=>{
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
                                                    .insert(testMatches);
                                            })
                                    });
                            });
                    });
            });
            it('creates a new match with the two supplied listings',()=>{
                return supertest(app)
                    .post('/api/matches')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({
                        user1_id:2,
                        user2_id:3
                    })
                    .expect(201)
                    .expect(res=>{
                        expect(res.body.id).to.eql(testMatches.length+1)
                    });
            })
            it('gives an error if duplicate match is found',()=>{
                return supertest(app)
                    .post('/api/matches')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({
                        user1_id:1,
                        user2_id:2
                    })
                    .expect(400, {
                        error: {message: `Users already matched.`}
                    });
            });
        });
    });
    describe('DELETE /api/matches/:match_id',()=>{
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
                                                .insert(testMatches);
                                        })
                                });
                        });
                });
        });
        it('should delete the requested user and return a 204',()=>{
            return supertest(app)
                .delete('/api/matches/1')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(204);
        });
        it('should return an error if no user found',()=>{
            return supertest(app)
                .delete('/api/matches/1222')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(404);
        });
    });
});