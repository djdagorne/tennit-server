CREATE TYPE gender AS ENUM (
    'male',
    'female',
    'other'
);

ALTER TABLE tennit_users
  ADD COLUMN
    userGender gender NOT NULL;
    
ALTER TABLE tennit_users
  ADD COLUMN
    prefGender gender NOT NULL;
