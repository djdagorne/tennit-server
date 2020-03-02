const xss = require('xss')

const CommentsService = {
    getCommentsByMatchId(knex, match_id){
        return knex
            .raw(`
                SELECT
                    c.*,
                    l.firstname
                FROM tennit_comments c
                LEFT JOIN tennit_listings l on l.user_id = c.user_id
                WHERE c.match_id = ${match_id}
                ORDER BY c.id
            `)
            .then(res=>{
                return res.rows
            })
    },
    inspectMatch(knex, match_id){
        return knex.from('tennit_matches').select('*').where('id',match_id).first()
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
            .then(()=>{
                return knex
                .from('tennit_comments')
                .select('*')
                .where('match_id',newComment.match_id)
            })
    }
}

module.exports = CommentsService