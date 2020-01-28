const MatchesService = {
    getAllListings(knex){
        return knex('tennit_matches').select('*')
    },
    getMatchById(knex, id){
        return knex('tennit_matches')
            .select('*')
            .where('id',id)
            .first()
    },
    searchMatchesByUserId(knex, user_id){
        return knex
            .select('*')
            .from('tennit_matches')
            .where('user1_id',user_id)
            .or
            .where('user2_id',user_id)
    },
    deleteMatchById(knex, id){
        return knex('tennit_matches')
            .where({id})
            .delete()
    },
    checkExistingMatch(knex, user1_id, user2_id){
        return knex
            .select('*')
            .from('tennit_matches')
            .whereIn('user1_id', [user1_id, user2_id])
            .and
            .whereIn('user2_id',[user1_id, user2_id])
            .first()
    },
    makeNewMatch(knex, newMatch){
        return knex
            .into('tennit_matches')
            .insert(newMatch)
            .returning('*')
            .then(rows=>{
                return rows[0]
            })
    }
}

module.exports = MatchesService;