module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    REACT_APP_DB_URL: process.env.REACT_APP_DB_URL || 'postgresql://postgres:Ampersand1@localhost/tennit',
    REACT_APP_TEST_DB_URL: process.env.REACT_APP_TEST_DB_URL ||'postgresql://postgres:Ampersand1@localhost/tennit-test'
}