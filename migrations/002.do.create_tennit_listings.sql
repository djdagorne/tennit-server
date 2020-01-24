CREATE TABLE tennit_listings (
    user_id INTEGER REFERENCES tennit_users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    age INTEGER NOT NULL,
    province TEXT NOT NULL,
    city TEXT NOT NULL,
    neighborhood TEXT,
    rent INTEGER, 
    listing BOOLEAN NOT NULL,
    userBlurb TEXT,
    blurb TEXT
);