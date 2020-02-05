const xss = require('xss')

const ListingsService = {
    getAllListings(knex){
        return knex
            .select('tennit_listings.*','tennit_images.image')
            .from('tennit_listings')
            .leftJoin(
                'tennit_images',
                'tennit_listings.user_id',
                'tennit_images.user_id')
    },
    getListingById(knex, user_id){
        return knex
            .select('tennit_listings.*','tennit_images.image')
            .from('tennit_listings')
            .leftJoin(
                'tennit_images',
                'tennit_listings.user_id',
                'tennit_images.user_id')
            .where('tennit_listings.user_id',user_id)
            .first()
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
    getSearchResults(listings, province, city, rent){
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
        if(!!rent){
            listings = listings.filter(filter=>
                Number(filter.rent) <= Number(rent)
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
            ...newListing,
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