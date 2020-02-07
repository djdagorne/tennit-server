BEGIN;

TRUNCATE
    tennit_users,
    tennit_images,
    tennit_matches,
    tennit_comments
    RESTART IDENTITY CASCADE;

INSERT INTO tennit_users (email, password)
VALUES
    ('john@email.com','AAaa11!!'),
    ('susan@email.com','$2a$12$kJrJLlPChs01Vrw4bYXlOus5pJITEVYQY5PadR4FCn.RfiXcAbfsy'),
    ('gertrude@email.com','$2a$12$kJrJLlPChs01Vrw4bYXlOus5pJITEVYQY5PadR4FCn.RfiXcAbfsy'),
    ('margret@email.com','$2a$12$kJrJLlPChs01Vrw4bYXlOus5pJITEVYQY5PadR4FCn.RfiXcAbfsy'); 

INSERT INTO tennit_listings (user_id, firstname, lastname, usergender, prefgender, age, province, city, neighborhood, rent, listing, userblurb, blurb)
VALUES 
    (1,'John','Johnson','male','female',20,'Ontario','Toronto','Leaside',1000, TRUE,'i am user!','this is setting description!'),
    (2,'Susan','Susanson','female','male',25,'Ontario','Toronto','The Annex',1001, TRUE,'i am user!','this is setting description!'),
    (3,'Gertrude','Gertrudeson','female','male',22,'Ontario','Mississauga','Clarkson',1500, TRUE,'i am user!','this is setting description!'),
    (4,'Margret','Margretson','female','male',21,'Ontario','Toronto','Yorkdale',700, FALSE, 'i am user!','this is setting description!');

INSERT INTO tennit_images (image, user_id)
VALUES
    ('https://loremflickr.com/500/500/landscape?random=1', 1),
    ('https://loremflickr.com/500/500/landscape?random=2', 2),
    ('https://loremflickr.com/500/500/landscape?random=3', 3),
    ('https://loremflickr.com/500/500/landscape?random=4', 4);

INSERT INTO tennit_matches (user1_id, user2_id)
VALUES
    (1,2),
    (1,3),
    (1,4),
    (2,4);

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