CREATE TABLE tennit_images (
    id SERIAL PRIMARY KEY,
    image TEXT NOT NULL,
    user_id INTEGER REFERENCES tennit_users(id) ON DELETE CASCADE NOT NULL,
    date_modified TIMESTAMP NOT NULL DEFAULT now()
);