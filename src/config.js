module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    REACT_APP_DATABASE_URL: process.env.REACT_APP_DATABASE_URL || 'postgresql://postgres:Ampersand1@localhost/tennit',
    REACT_APP_TEST_DATABASE_URL: process.env.REACT_APP_TEST_DATABASE_URL ||'postgresql://postgres:Ampersand1@localhost/tennit-test',
    JWT_SECRET: process.env.JWT_SECRET || 'secret',
    JWT_EXPIRY: process.env.JWT_EXPIRY
}