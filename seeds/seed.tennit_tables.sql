BEGIN;

TRUNCATE
    tennit_users,
    tennit_images,
    tennit_matches,
    tennit_comments
    RESTART IDENTITY CASCADE;

INSERT INTO tennit_users (email, password, firstName, lastName, userGender, prefGender, age, provence, city, neighborhood, rent, listing, userBlurb, blurb)
VALUES
    ('john@email.com','AAaa11!!','John','Johnson','male','female',20,'Ontario','Toronto','Leaside',1000, TRUE,'i am user!','this is setting description!'),
    ('susan@email.com','AAaa11!!','Susan','Susanson','female','male',20,'Ontario','Toronto','The Annex',1001, TRUE,'i am user!','this is setting description!'),
    ('gertrude@email.com','AAaa11!!','Gertrude','Gertrudeson','female','male',20,'Ontario','Mississauga','Clarkson',1500, TRUE,'i am user!','this is setting description!'),
    ('margret@email.com','AAaa11!!','Margret','Margretson','female','male',20,'Ontario','Toronto','Yorkdale',700, FALSE, 'i am user!','this is setting description!');

INSERT INTO tennit_images (image, user_id)
VALUES
    ('https://loremflickr.com/500/500/landscape?random=1', 1),
    ('https://loremflickr.com/500/500/landscape?random=2', 2),
    ('https://loremflickr.com/500/500/landscape?random=3', 3),
    ('https://loremflickr.com/500/500/landscape?random=4', 4);

INSERT INTO tennit_matches (user1_id, user2_id, user1_bool, user2_bool)
VALUES
    (1,2,TRUE,TRUE),
    (1,3,FALSE,TRUE),
    (1,4,FALSE,TRUE),
    (2,4,TRUE,TRUE);

INSERT INTO tennit_comments (match_id, user_id, comment)
VALUES 
    (1,1,'blah blah blah'),
    (1,2,'blah blah blah'),
    (1,1,'blah blah blah'),
    (2,3,'blah blah blah'),
    (2,1,'blah blah blah'),
    (2,3,'blah blah blah'),
    (3,1,'blah blah blah'),
    (3,4,'blah blah blah'),
    (3,4,'blah blah blah'),
    (3,1,'blah blah blah'),
    (3,4,'blah blah blah'),
    (4,4,'blah blah blah'),
    (4,2,'blah blah blah'),
    (4,4,'blah blah blah'),
    (4,2,'blah blah blah'),
    (4,4,'blah blah blah');

COMMIT;