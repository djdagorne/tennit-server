const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUserArray() {
    return [
        {
            id: 1,
            email: 'john@email.com',
            password: 'AAaa11!!',
            firstName: 'John',
            lastName: 'Johnson',
            gender: 'male',
            prefGender: 'female',
            age: 20,
            phone: '555-555-5555',
            neighborhood: 'Leaside',
            location: {
                provence: 'Ontario',
                city: 'Toronto'
            },
            rent: 1000,
            listing: true,
            userBlurb: 'i am user!',
            blurb: 'this is setting description!',
        },
        {
            id: 2,
            email: 'susan@email.com',
            password: 'AAaa11!!',
            firstName: 'Susan',
            lastName: 'Susanson',
            gender: 'female',
            prefGender: 'male',
            age: 20,
            phone: '555-555-5555',
            neighborhood: 'The Annex',
            location: {
                provence: 'Ontario',
                city: 'Toronto'
            },
            rent: 1001,
            listing: true,
            userBlurb: 'i am user!',
            blurb: 'this is setting description!',
        },
        {
            id: 3,
            email: 'gertrude@email.com',
            password: 'AAaa11!!',
            firstName: 'Gertrude',
            lastName: 'Gertrudeson',
            gender: 'female',
            prefGender: 'male',
            age: 20,
            phone: '555-555-5555',
            neighborhood: 'Clarkson',
            location: {
                provence: 'Ontario',
                city: 'Mississauga'
            },
            rent: 1500,
            listing: true,
            userBlurb: 'i am user!',
            blurb: 'this is setting description!',
        },
        {
            id: 4,
            email: 'margret@email.com',
            password: 'AAaa11!!',
            firstName: 'Margret',
            lastName: 'Margretson',
            gender: 'female',
            prefGender: 'male',
            age: 20,
            phone: '555-555-5555',
            neighborhood: 'Yorkdale',
            location: {
                provence: 'Ontario',
                city: 'Toronto'
            },
            rent: 700,
            listing: false,
            userBlurb: 'i am user!',
            blurb: 'this is setting description!',
        },
    ]
}

function makeImageArray(user){
    return [
        {
            id: 1,
            image: 'https://loremflickr.com/500/500/landscape?random=1',
            user_id: user[0].id,
            date_updated: new Date(),
        },
        {
            id: 2,
            image: 'https://loremflickr.com/500/500/landscape?random=2',
            user_id: user[0].id,
            date_updated: new Date(),
        },
        {
            id: 3,
            image: 'https://loremflickr.com/500/500/landscape?random=3',
            user_id: user[0].id,
            date_updated: new Date(),
        },
        {
            id: 4,
            image: 'https://loremflickr.com/500/500/landscape?random=4',
            user_id: user[1].id,
            date_updated: new Date(),
        },
        {
            id: 5,
            image: 'https://loremflickr.com/500/500/landscape?random=5',
            user_id: user[1].id,
            date_updated: new Date(),
        },
        {
            id: 6,
            image: 'https://loremflickr.com/500/500/landscape?random=6',
            user_id: user[1].id,
            date_updated: new Date(),
        },
    ]
}

//how will matches be created?
//a user will 'like' another user_id and it will create a new column to keep track of the relationship between users.
//when any user is on their homepage it will perform a Match Table search and display any profiles that are falsely matched AND contain the signed in users user_id
//if either user 'dislikes' the other user, it will filter the match row from their lists


//NOTES ANTHONY; dont do two way 'like system', make it more like a marketplace app

function makeMatchArray(users){
    return [
        {
            id: 1,
            user1_id: users[0].id, //FK john
            user2_id: users[1].id, //FK susan
            user1_bool: true, 
            user2_bool: true, //susan and john liked eachother
            filter: false,
        },
        {
            id: 2,
            user1_id: users[0].id, //FK john
            user2_id: users[2].id, //FK gert
            user1_bool: false, 
            user2_bool: true, //susan2  liked john
            filter: false
        },
        {
            id: 3,
            user1_id: users[0].id, //FK john
            user2_id: users[3].id, //FK marg
            user1_bool: false, 
            user2_bool: true, //susan3 liked john
            filter: false,
        },
        {
            id: 4,
            user1_id: users[1].id, //FK susan 1
            user2_id: users[3].id, //FK marg
            user1_bool: true, 
            user2_bool: true, 
            filter: false,
        },
    ]
}
//how will convo's be created? 
//once both users 'like' each other, both booleans being true, it will create a new row in the convo table
//when users are on their profile, the page will display links to convos via the convo.id to a new page that displays comments associated with it

// function makeConvoArray(matches){
//     return[
//         {
//             id: 1,
//             user1_id: matches[0].user1_id, //FK
//             user2_id: matches[0].user2_id, //FK
//             date_created: new Date(),
//         },
//         {
//             id: 2,
//             user1_id: matches[3].user1_id, //FK
//             user2_id: matches[3].user2_id, //FK
//             date_created: new Date(),
//         },
//     ]
// }

function makeCommentArray(matches){
    return[
        {
            id: 1,
            convo_id: matches[0].id,
            poster_id: matches[0].user1_id,
            comment: 'blah blah blah'
        },
        {
            id: 2,
            convo_id: matches[0].id,
            poster_id: matches[0].user2_id,
            comment: 'blah blah blah'
        },
        {
            id: 3,
            convo_id: matches[0].id,
            poster_id: matches[0].user1_id,
            comment: 'blah blah blah'
        },
        {
            id: 4,
            convo_id: matches[1].id,
            poster_id: matches[1].user1_id,
            comment: 'blah blah blah123123'
        },
        {
            id: 5,
            convo_id: matches[0].id,
            poster_id: matches[0].user2_id,
            comment: 'blah blah blah'
        },
        {
            id: 6,
            convo_id: matches[2].id,
            poster_id: matches[2].user1_id,
            comment: 'blah blah blah'
        },
    ]
}

//convo link display: 
//if matches.user1_bool && matches.user2_bool = true, 
//      SEARCH FOR EXISTING CONVO
//      from tennit_convo table -> select convo.id -> 
//      where convo.user1_id=matches.user1_id && convo.user2_id=matches.user2_id

function makeThingsFixtures(){
    const testUsers = makeUserArray()
    const testImages = makeImageArray(testUsers)
    const testMatches = makeMatchArray(testUsers)
    const testComments = makeCommentArray(testMatches)

    return { testUsers, testImages, testMatches, testComments}
}


module.exports = {
    makeUserArray,
    makeImageArray,
    makeMatchArray,
    makeCommentArray,

    makeThingsFixtures,
}