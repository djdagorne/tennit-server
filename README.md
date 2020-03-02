# Tennit Server by Dexter Dagorne


[View the live version](tennit.djdagorne.now.sh)

This is the serverside node app used to supply my Tennit Client project with its API and endpoints. It was made using express, knex, postgresql, chai, bcrypt, jsonwebtokens and more (see package.json for details). The API provides various information to the client such as user logging in with expiring tokens, searchable and postable listings, creating and deleting matches and conversation tracking.

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Endpoints

The API consist of a few endpoints to give the client its data. Theres the users, listings, matches, convos, images, and thats all protected by a jwt powered auth endpoint.

### /api/users

The users endpoint is used for account creation. Its primary function is to POST at the /api/users endpoint. Takes an object and verifies and sanitizes data using isWebUri and xss before posting to the database.

### /api/listings

The listings endpoint is the backbone of the app, letting users post, patch, get and delete listings as necessary. This endpoint uses xss to sanitize user posted data on its way in and out of the server to protect the database and user clients.  /api/listings/ takes a query and searches the database for matching listings or takes an object in the request body to create new listings. This endpoint also uses a leftJoin to supply images when supplying the client with listing objects.

### /api/listings/:user_id

the /api/listings/:user_id endpoint requires no query and can find user profiles by their ID, delete listings, or update with a supplied with an object to patch. This endpoint also uses a leftJoin to supply images when supplying the client with listing objects.

### /api/images & /api/images/:user_id

this endpoint was created seperately to listings and is used to handle posting new images to the db, as well as updating and deleting images. If a user_id param is supplied, it can obtain user images.

### /api/matches & /api/matches/:match_id

This endpoint pertains to the creating, reading, and deleting of matches. /api/matches takes objects created by the client and creates new matches to the database which allows the database to create comments based around the match_id as a foreign key. it also takes supplied params to find specific match pages for the user to view and create comments on the client side.

### /api/comments & /api/comments/:match_id

This endpoint allows users to post and read comments that reference a match_id as a foreign key. When posting the endpoint takes an object with the users id, the match id, and the comment itself. When the endpoint is given a match_id param in the get request, it will fetch all comments associated with that match_id.

### /api/login & /api/refresh

This endpoint is my basic implementation of session security and web token management. The /login endpoint as you can probably guess, handles user login attempts, by taking an object in the request body, comparing the emails to verify the user exists, then compares the supplied password with hashed password kept in the database.  
The /refresh endpoint takes a supplied web token, and sends back a new one with a reset countdown until the token time expires. The client will read the timer on the web token, set up a callback function that executes before the token expires; if any event listener is triggered, it refreshes the token 10 seconds before the session expires. If no event listener is triggered, the token expires as normal, the client deletes the session token, and logs the user out, sending them to the splash page to protect their information.
