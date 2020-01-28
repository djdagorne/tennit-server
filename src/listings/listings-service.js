const xss = require('xss')

const ListingsService = {
    getAllListings(knex){
        return knex.select('*').from('tennit_listings')
    },
    getListingById(knex, user_id){
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
    getSearchResults(listings, province, city, neighborhood, rent){
        if(!!province){
            listings = listings.filter(filter=>
                filter.province.toLowerCase().includes(province.toLowerCase())    
            )
        }
        if(!!city){
            listings = listings.filter(filter=>
                filter.city.toLowerCase().includes(city.toLowerCase())    
            )
        }
        if(!!neighborhood){
            listings = listings.filter(filter=>
                filter.neighborhood.toLowerCase().includes(neighborhood.toLowerCase())    
            )
        }
        if(!!rent){
            listings = listings.filter(filter=>
                Number(filter.rent) >= Number(rent)
            )
        }
        if(listings.length > 0){
            return listings
        }else{
            return {error: {message: 'Search returned empty.'}}
        }
    },
    updateListing(knex, user_id, newListingFields){
        return knex('tennit_listings')
            .where({user_id})
            .update(newListingFields)
    },
    serializeListing(newListing){
        return {
            user_id: newListing.user_id,
            firstname: xss(newListing.firstname),
            lastname: xss(newListing.lastname),
            usergender: newListing.usergender,
            prefgender: newListing.prefgender,
            age: newListing.age,
            province: xss(newListing.province),
            city: xss(newListing.city),
            neighborhood: xss(newListing.neighborhood),
            rent: newListing.rent,
            listing: newListing.listing,
            userblurb: xss(newListing.userblurb),
            blurb: xss(newListing.blurb),
        }
    }
}

module.exports = ListingsService;