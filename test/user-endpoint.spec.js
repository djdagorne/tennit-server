const app = require('../src/app')
const knex = require('knex')
const helpers = require('./test-helpers')
const testUsers = helpers.makeUserArray()

describe('Users Endpoints', function() {
    let db 
    before('make knex instance',()=>{
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })
    before('clean the tables', () => db.raw('TRUNCATE tennit_users, tennit_images, tennit_matches, tennit_comments RESTART IDENTITY CASCADE'))
    afterEach('clean the tables',()=> db.raw('TRUNCATE tennit_users, tennit_images, tennit_matches, tennit_comments RESTART IDENTITY CASCADE'))
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
                    .get('/api/users')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].firstname).to.eql(testUsers[0].firstname)
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
                        expect(res.body.firstname).to.eql(testUsers[0].firstname)
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
        context('given an xss attack and empty db',()=>{
            const {maliciousUser, expectedUser} = helpers.makeMaliciousUser()
            beforeEach('insert user',()=>{
                return db
                    .into('tennit_users')
                    .insert(maliciousUser)
            })
            it(`responds with 200 and santizes the content`,() => {
                return supertest(app)
                    .get('/api/users/1')
                    .expect(200, {
                        id: 1,
                        ...expectedUser
                    })

            })
        })
    })
    describe('POST /api/users/',()=>{
        it('it creates a new user, responds with 201 and the user object',()=>{
            return supertest(app)
                .post('/api/users')
                .send(testUsers[1])
                .expect(201)
                .expect(res=>{
                    expect(res.body.firstname).to.eql(testUsers[1].firstname)
                    expect(res.body).to.have.property('id')
                    expect(res.header.location).to.eql(`/`)
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
                        .send(testUsers[1])
                        .expect(400, {error: {message: `Email already in use.`}} )
            })
        })
        context('field validation',()=>{
            const requiredFields = ['email', 'password', 'firstname', 'lastname', 'age', 'province', 'city', 'listing']
            requiredFields.forEach(field => {
                const testUsers = helpers.makeUserArray()
                const newUser = testUsers[0]
                it(`responds with 400 and an error message when the '${field}' is missing`,() => {
                    newUser[field] = null
                    return supertest(app)
                        .post('/api/users')
                        .send(newUser)
                        .expect(400, {
                            error: { message: `Missing '${field}' in request body.`}
                        })
                })
            })
        })
    })
    describe('DELETE /api/users/:user_id',()=>{
        context('given there are users in the database',()=>{
            beforeEach('insert users',()=>{
                return db
                    .into('tennit_users')
                    .insert(testUsers)
            })
            it('responds with 204 and successfully removes user',()=>{
                const expectedUsers = testUsers.slice(1)
                return supertest(app)
                    .delete('/api/users/1')
                    .expect(204)
                    .then(res=>
                        supertest(app)
                            .get(`/api/users/`)
                            .expect(200)
                            .expect(res=>{
                                expect(res.body[0].id).to.eql(2)
                            })
                    )
            })
        })
        context('given an empty database',()=>{
            it('responds with 404',()=>{
                return supertest(app)
                    .delete(`/api/users/120182312`)
                    .expect(404, { error: { message: `User doesn't exist.`}})
            })
        })
    })
}) 