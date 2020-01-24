CREATE TYPE gender AS ENUM (
    'male',
    'female',
    'other'
);

ALTER TABLE tennit_listings
  ADD COLUMN
    userGender gender NOT NULL;
    
ALTER TABLE tennit_listings
  ADD COLUMN
    prefGender gender NOT NULL;
