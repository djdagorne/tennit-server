const xss = require('xss')

const CommentsService = {
    getCommentsByMatchId(knex, match_id){
        return knex.from('tennit_comments').select('*').where('match_id',match_id)
    },
    sanitizeComment(newComment){
        return {
            ...newComment,
            comment: xss(newComment.comment)
        }
    },
    insertNewComment(knex, newComment){
        return knex
            .insert(newComment)
            .into('tennit_comments')
            .returning('*')
            .then(rows=>{
                return rows[0]
            })
    }

}

module.exports = CommentsService;