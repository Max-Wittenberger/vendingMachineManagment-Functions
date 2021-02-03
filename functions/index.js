const functions = require("firebase-functions");

const app = require('express')(); 

const FBAuth = require('./util/FBAuth');

const { getAllScreams, postOneScream, getScream, commentOnScream} = require('./handlers/screams');
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users');


// Scream routs
app.get('/screams', getAllScreams);
app.get('/scream/:screamId', getScream)
app.post('/scream', FBAuth, postOneScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream)
// TODO: delete
// TODO: like a scream
// TODO: unlike a scream
// TODO: comment on scream 



// users routs
app.post('/signup', signup);
app.post('/login', login );

app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser)


exports.api = functions.region('europe-west3').https.onRequest(app);