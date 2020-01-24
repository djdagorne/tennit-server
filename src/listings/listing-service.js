const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/
const xss = require('xss')
const bcrypt = require('bcryptjs')

const UsersService = {
    getAllListings(knex){
        return knex.select('*').from('tennit_listings')
    },
    getListingById(knex, id){
        return knex.from('tennit_listings').select('*').where('user_id',user_id).first()
    },
    insertNewListing(knex, newListing){
        return knex
            .insert(newListing)
            .into('tennit_listings')
            .returning('*')
            .then(rows=>{
                return rows[0]
            })
    },
    // getSearchResults(knex, province, city, neighborhood){
    //     return knex('tennit_listings')
    //         .where(province)
    //         .then()
    // },
    deleteListing(knex, id){
        return knex('tennit_listings')
            .where({id})
            .delete()
    },
    updateListing(knex, id, newListingFields){
        return knex('tennit_listings')
            .where({id})
            .update(newListingFields)
    },
    serializeUser(listing){
        return {
            ...listing,
            firstname: xss(listing.firstname),
            lastname: xss(listing.lastname),
            province: xss(listing.province),
            city: xss(listing.city),
            neighborhood: xss(listing.neighborhood),
            userblurb: xss(listing.userblurb),
            blurb: xss(listing.blurb),
        }
    }
}

module.exports = ListingsService;