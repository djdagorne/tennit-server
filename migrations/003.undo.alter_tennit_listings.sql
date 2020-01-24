ALTER TABLE tennit_listings DROP COLUMN IF EXISTS userGender;
ALTER TABLE tennit_listings DROP COLUMN IF EXISTS prefGender;

DROP TYPE IF EXISTS gender;
