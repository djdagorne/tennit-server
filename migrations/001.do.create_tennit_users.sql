CREATE TABLE tennit_users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    age INTEGER NOT NULL,
    provence TEXT NOT NULL,
    city TEXT NOT NULL,
    neighborhood TEXT,
    rent INTEGER, 
    listing BOOLEAN NOT NULL,
    userBlurb TEXT,
    blurb TEXT
);