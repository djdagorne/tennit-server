function makeUserArray() {
    return [
        {
            email: 'john@email.com',
            password: 'AAaa11!!',
        },
        {
            email: 'susan@email.com',
            password: 'AAaa11!!',
        },
        {
            email: 'gertrude@email.com',
            password: 'AAaa11!!',
        },
        {
            email: 'margret@email.com',
            password: 'AAaa11!!',
        },
    ]
}

function makeListingArray(user){
    return [
        {
            user_id: user[0].id,
            firstname: 'John',
            lastname: 'Johnson',
            usergender: 'male',
            prefgender: 'female',
            age: 20,
            province: 'Ontario',
            city: 'Toronto',
            userblurb: 'i am user!',
            listing: true,
            neighborhood: 'Leaside',
            rent: 1000,
            blurb: 'this is setting description!',
        },
        {
            user_id: user[1].id,
            firstname: 'Susan',
            lastname: 'Susanson',
            usergender: 'female',
            prefgender: 'other',
            age: 20,
            province: 'Ontario',
            city: 'Toronto',
            neighborhood: 'The Annex',
            rent: 1001,
            listing: true,
            userblurb: 'i am user!',
            blurb: 'this is setting description!',
        },
        {
            user_id: user[2].id,
            firstname: 'Gertrude',
            lastname: 'Gertrudeson',
            usergender: 'female',
            prefgender: 'male',
            age: 20,
            province: 'Ontario',
            city: 'Mississauga',
            neighborhood: 'Clarkson',
            rent: 1500,
            listing: true,
            userblurb: 'i am user!',
            blurb: 'this is setting description!',
        },
        {
            user_id: user[3].id,
            firstname: 'Margret',
            lastname: 'Margretson',
            usergender: 'female',
            prefgender: 'other',
            age: 20,
            province: 'Ontario',
            city: 'Toronto',
            neighborhood: 'Yorkdale',
            listing: false,
            rent: 700,
            userblurb: 'i am user!',
            blurb: 'this is setting description!',
        }

    ]
}

function makeImageArray(listing){ 
    return [
        {
            image: 'https://loremflickr.com/500/500/landscape?random=1',
            user_id: listing[0].user_id,
            date_modified: new Date(),
        },
        {
            image: 'https://loremflickr.com/500/500/landscape?random=2',
            user_id: listing[1].user_id,
            date_modified: new Date(),
        },
        {
            image: 'https://loremflickr.com/500/500/landscape?random=3',
            user_id: listing[2].user_id,
            date_modified: new Date(),
        },
        {
            image: 'https://loremflickr.com/500/500/landscape?random=4',
            user_id: listing[3].user_id,
            date_modified: new Date(),
        },
    ]
}

//how will matches be created?
//a user will 'like' another user_id and it will create a new column to keep track of the relationship between users.
//when any user is on their homepage it will perform a Match Table search and display any profiles that are falsely matched AND contain the signed in users user_id
//if either user 'dislikes' the other user, it will filter the match row from their lists


//NOTES ANTHONY; dont do two way 'like system', make it more like a marketplace app

function makeMatchArray(listings){
    return [
        {
            user1_id: listings[0].user_id, //FK john
            user2_id: listings[1].user_id, //FK susan
        },
        {
            user1_id: listings[0].user_id, //FK john
            user2_id: listings[2].user_id, //FK gert
        },
        {
            user1_id: listings[0].user_id, //FK john
            user2_id: listings[3].user_id, //FK marg
        },
        {
            user1_id: listings[1].user_id, //FK susan 1
            user2_id: listings[3].user_id, //FK marg
        },
    ]
}

function makeCommentArray(matches){
    return[
        {
            match_id: matches[0].id,
            user_id: matches[0].user1_id,
            comment: 'blah blah blah'
        },
        {
            match_id: matches[0].id,
            user_id: matches[0].user2_id,
            comment: 'blah blah blah'
        },
        {
            match_id: matches[0].id,
            user_id: matches[0].user1_id,
            comment: 'blah blah blah'
        },
        {
            match_id: matches[1].id,
            user_id: matches[1].user1_id,
            comment: 'blah blah blah123123'
        },
        {
            match_id: matches[0].id,
            user_id: matches[0].user2_id,
            comment: 'blah blah blah'
        },
        {
            match_id: matches[2].id,
            user_id: matches[2].user1_id,
            comment: 'blah blah blah'
        },
        {
            match_id: matches[2].id,
            user_id: matches[2].user2_id,
            comment: 'blah blah blah'
        },
        {
            match_id: matches[2].id,
            user_id: matches[2].user1_id,
            comment: 'blah blah blah'
        },
    ]
}
function makeMaliciousListing(users) {
    const maliciousListing = 
        {
            user_id: users[0].id,
            firstname: 'Naughty naughty very naughty <script>alert("xss");</script>',
            lastname: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
            usergender: 'male',
            prefgender: 'female',
            age: 20,
            province: 'Ontario',
            city: 'Toronto',
            neighborhood: 'Leaside',
            rent: 1000,
            listing: true,
            userblurb: 'i am user!',
            blurb: 'this is setting description!',
        }
    const expectedListing = 
        {
            ...maliciousListing,
            firstname: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
            lastname: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
        } 
    return {
        maliciousListing,
        expectedListing
    }
}

function makeThingsFixtures(){
    const testUsers = makeUserArray()
    const testListings = makeListingArray(testUsers)
    const testImages = makeImageArray(testListings)
    const testMatches = makeMatchArray(testListings)
    const testComments = makeCommentArray(testMatches)

    return { testUsers, testListings, testImages, testMatches, testComments}
}


module.exports = {
    makeUserArray,
    makeListingArray,
    makeImageArray,
    makeMatchArray,
    makeCommentArray,
    makeMaliciousListing,

    makeThingsFixtures,
}