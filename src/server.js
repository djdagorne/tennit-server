const app = require('./app');
const knex = require('knex')
const { PORT, REACT_APP_DB_URL, REACT_APP_TEST_DB_URL } = require('./config')

const db = knex({
    client: 'pg',
    connection: REACT_APP_DB_URL,
})
app.set('db',db)

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
})