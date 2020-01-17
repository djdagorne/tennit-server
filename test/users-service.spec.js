const app = require('../src/app')
const knex = require('knex')
const helpers = require('./test-helpers')
const UsersService = require('../src/users/users-service')

describe(`UsersService object`, function(){

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
    
    context(`given 'tennit_users' has data`,()=>{

        const testUsers = helpers.makeUserArray()
        beforeEach('insert the users',()=>{
            return db
                .into('tennit_users')
                .insert(testUsers)
        })
    
        describe(`getAllUsers()`,()=>{
            it(`resolves all users from 'tennit_users' table`,()=>{
                return UsersService.getAllUsers(db)
                    .then(actual => {
                        expect(actual).to.eql(testUsers)
                    })
            })
        })
        describe(`getUserById()`,()=>{
            it(`gets user by id from 'tennit_users' table`,()=>{
                const thirdId = 3
                const thirdUser = testUsers[thirdId-1]
                return UsersService.getUserById(db, thirdId)
                    .then(actual=>{
                        expect(actual).to.eql(thirdUser)
                    })
            })
        })
        describe(`deleteUser()`,()=>{
            it(`deletes user from 'tennit_users' table by id`,()=>{
                const thirdId = 3
                const expected = testUsers.filter(user => user.id !== thirdId)
                return UsersService.deleteUser(db, thirdId)
                    .then(()=>UsersService.getAllUsers(db))
                    .then(actual=>{
                        console.log(actual)
                        expect(actual).to.eql(expected)
                    })
            })
        })
        describe(`updateUser()`,()=>{
            it(`updates user in 'tennit_users'`,()=>{
                console.log('running updateUser test')
                const thirdId = 3
                const newUserData = {
                    ...testUsers[2],
                    neighborhood: 'Updated',
                    rent: 700,
                }
                return UsersService.updateUser(knex, thirdId, newUserData)
                    .then(()=> UsersService.getUserById(db, thirdId))
                    .then(user=>{
                        expect(user).to.eql({
                            id: thirdId,
                            ...newUserData,
                        })
                    })
            })
        })
    })

    context(`given 'tennit_users' has no data`,()=>{
            it(`resolves no users from 'tennit_users' table`,()=>{
                return UsersService.getAllUsers(db)
                    .then(actual => {
                        expect(actual).to.eql([])
                    })
            })
            it(`insertNewUser() inserts a new user and resolves the new user with an id`,()=>{
                const newUser = {
                    email: 'test@email.com',
                    password: 'AAaa11!!',
                    firstname: 'testy',
                    lastname: 'test',
                    usergender: 'female',
                    prefgender: 'female',
                    age: 20,
                    provence: 'testy',
                    city: 'testy',
                    neighborhood: 'tester',
                    rent: 700,
                    listing: false,
                    userblurb: 'test!',
                    blurb: 'testy!',
                }
                return UsersService.insertNewUser(db, newUser)
                    .then(actual=>{
                        expect(actual).to.eql({
                            id: 1,
                            email: 'test@email.com',
                            password: 'AAaa11!!',
                            firstname: 'testy',
                            lastname: 'test',
                            usergender: 'female',
                            prefgender: 'female',
                            age: 20,
                            provence: 'testy',
                            city: 'testy',
                            neighborhood: 'tester',
                            rent: 700,
                            listing: false,
                            userblurb: 'test!',
                            blurb: 'testy!',
                        })
                    })
            })
    })
})