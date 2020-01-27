CREATE TABLE tennit_matches (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER REFERENCES tennit_listings(user_id) ON DELETE CASCADE NOT NULL,
    user2_id INTEGER REFERENCES tennit_listings(user_id) ON DELETE CASCADE NOT NULL
);