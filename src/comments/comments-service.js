const xss = require('xss')

const CommentsService = {
    getCommentByMatchId(knex, match_id){
        return knex.from('tennit_comments').select('*').where('match_id',match_id)
    },
    sanitizeComment(newComment){
        return {
            match_id: newComment.match_id,
            user_id: newComment.user_id,
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
    },
    deleteComment(knex, commentId){
        return knex('tennit_comments')
            .where({id})
            .delete()
    }

}

module.exports = CommentsService;