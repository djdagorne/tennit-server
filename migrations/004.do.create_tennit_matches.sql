CREATE TABLE tennit_matches (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER REFERENCES tennit_users(id) ON DELETE CASCADE NOT NULL,
    user2_id INTEGER REFERENCES tennit_users(id) ON DELETE CASCADE NOT NULL,
    user1_bool BOOLEAN,
    user2_bool BOOLEAN
);