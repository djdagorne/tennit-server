CREATE TABLE tennit_comments (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES tennit_matches(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES tennit_listings(user_id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL
);