require('dotenv').config();

module.exports = {
  "migrationDirectory": "migrations",
  "driver": "pg",
  "connectionString": (process.env.NODE_ENV === 'test')
    ? process.env.REACT_APP_TEST_DATABASE_URL
    : process.env.REACT_APP_DATABASE_URL,
    "ssl": !!process.env.SSL,
}
