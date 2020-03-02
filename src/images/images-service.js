const { isWebUri } = require('valid-url')

const ImagesService = {
    getImageByUserId(knex, user_id){
        return knex.select('*').from('tennit_images').where({user_id}).first()
    },
    validateUrl(newImage){
        if(newImage.image && !isWebUri(newImage.image)){
            return false
        }else{
            return true
        }
    },
    doesUserExist(knex, user_id){
        return knex
            .select('*')
            .from('tennit_images')
            .where({user_id})
            .first()
    },
    insertImage(knex, newImage){
        return knex('tennit_images')
            .insert(newImage)
            .returning('*')
            .then(rows=>{
                return rows[0]
            })
    },
    updateImage(knex, user_id, newImage){
        return knex('tennit_images')
            .where({user_id})
            .update(newImage)
            .returning('*')
            .then(rows=>{
                return rows[0]
            })
    }
}

module.exports = ImagesService