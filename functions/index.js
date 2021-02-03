const functions = require("firebase-functions");

const app = require('express')(); 

const FBAuth = require('./util/FBAuth');

const { getAllScreams, postOneScream } = require('./handlers/screams');
const { signup, login, uploadImage } = require('./handlers/users');


// Scream routs
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);


// users routs
app.post('/signup', signup);
app.post('/login', login );
app.post('/user/image', FBAuth, uploadImage);



exports.api = functions.region('europe-west3').https.onRequest(app);