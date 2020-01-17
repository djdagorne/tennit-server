const app = require('./app');
const knex = require('knex')
const { PORT, DB_URL, TEST_DB_URL } = require('./config')

const db = knex({
    client: 'pg',
    connection: DB_URL,
})
app.set('db',db)

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
})