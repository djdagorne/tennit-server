const xss = require('xss')

const MatchesService = {
    searchMatchesByUserId(knex, user_id){
        return knex.from('tennit_matches').select('*').where('user1_id',user_id)
    }
}