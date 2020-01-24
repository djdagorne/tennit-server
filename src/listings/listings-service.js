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
        console.log('gSR')
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
        console.log(listings) //TODO data gets here fine but isn't return properly wtf mon
        return listings //TODO figure this one out
        console.log('wtf')
        
    },
    updateListing(knex, user_id, newListingFields){
        return knex('tennit_listings')
            .where({user_id})
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