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
            .raw(`
                SELECT 
                    m.id, 
                    m.user1_id, 
                    m.user2_id, 
                    l.firstname AS firstname_1, 
                    l.lastname AS lastname_1, 
                    l2.firstname AS firstname_2, 
                    l2.lastname AS lastname_2
                FROM tennit_matches m 
                LEFT JOIN tennit_listings l ON m.user1_id = l.user_id
                LEFT JOIN tennit_listings l2 ON m.user2_id = l2.user_Id
                WHERE m.user1_id = ${user_id}
                OR 
                m.user2_id = ${user_id};
            `)
            .then(res=>{
                return res.rows
            })
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