const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/
const xss = require('xss')
const bcrypt = require('bcryptjs')

const UsersService = {
    getAllUsers(knex){
        return knex.select('*').from('tennit_users')
    },
    getUserById(knex, id){
        return knex.from('tennit_users').select('*').where('id',id).first()
    },
    getUserByEmail(knex, email){
        return knex.from('tennit_users').select('*').where('email',email).first()
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
    deleteUser(knex, id){
        return knex('tennit_users')
            .where({id})
            .delete()
    },
    hashPassword(password){
        return bcrypt.hash(password, 1) //hash
    },
    updateUser(knex, id, newUserFields){
        return knex('tennit_listings')
            .where({id})
            .update(newUserFields)
    },
    hasUserWithEmail(knex, email){
        return knex('tennit_users')
            .where('email',email)
            .first()
            .then(user => !!user)
    },    
    validatePassword(password){
        if(password.length <= 7){
            return 'Password must be at least 8 characters'
        }
        if(password.length > 72){
            return 'Password must be 72 characters or fewer'
        }
        if(password.startsWith(' ') || password.endsWith(' ')){
            return 'Password must not start or end with spaces'
        }
        if(!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)){
            return `Password must contain 1 upper case, lower case, number and special character`
        }
        return null
    }
}

module.exports = UsersService