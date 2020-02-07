require('dotenv').config();

module.exports = {
  "migrationDirectory": "migrations",
  "driver": "pg",
  "connectionString": (process.env.NODE_ENV === 'test')
    ? process.env.REACT_APP_TEST_DB_URL
    : process.env.REACT_APP_DB_URL,
}
