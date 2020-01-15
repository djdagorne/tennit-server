CREATE TABLE tennit_comments (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES tennit_matches(id),
    user_id INTEGER REFERENCES tennit_users(id),
    comment TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL
);