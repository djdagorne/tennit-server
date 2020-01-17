const UsersService = {
    getAllUsers(knex){
        return knex.select('*').from('tennit_users')
    },
    insertNewUser(knex, newUser){
        return knex
            .insert(newUser)
            .into('tennit_users')
            .returning('*')
            .then(rows=>{
                return rows[0]
            })
    },
    getUserById(knex, id){
        return knex.from('tennit_users').select('*').where('id',id).first()
    },
    deleteUser(knex, id){
        return knex('tennit_users')
            .where({id})
            .delete()
    },
    updateUser(knex, id, newUserFields){
        return knex('tennit_users')
            .where({ id })
            .update({newUserFields})
    }
}

module.exports = UsersService;