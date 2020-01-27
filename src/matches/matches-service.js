const xss = require('xss')

const MatchesService = {
    searchMatchesByUserId(knex, user_id){
        return knex.select('*').from('tennit_matches').where('user1_id',user_id).or.where('user2_id',user_id)
    }
}

module.exports = MatchesService;