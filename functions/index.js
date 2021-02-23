const functions = require("firebase-functions");

const app = require('express')(); 

const FBAuth = require('./util/FBAuth');

const cors =  require('cors');

app.use(cors());

const { getAllScreams, postOneScream, getScream, commentOnScream, likeScream, unlikeScream, deleteScream} = require('./handlers/screams');
const { getAllVendingMachines, getVendingMachine, createVendingMachine } = require('./handlers/vendingMachines');
const { signup, login, addUserDetails, getAuthenticatedUser } = require('./handlers/users');
const { getArticleData, updateArticle, createArticle } = require('./handlers/article');
const { uploadImage } = require('./handlers/general');

// vending machine routes 
app.get('/vendingMachines', FBAuth,  getAllVendingMachines );
app.get('/vendingMachine/:vendingMachineId', getVendingMachine );
app.post('/vendingMachine', createVendingMachine );

// article routes
app.get('/article/:articleId', getArticleData);
app.post('/article/:articleId', updateArticle);
app.post('/article', createArticle);

//general
app.post('/image', uploadImage);

// Scream routs
app.get('/screams', getAllScreams);
app.get('/scream/:screamId', getScream)
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);

app.post('/scream', FBAuth, postOneScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream)

app.delete('/scream/:screamId', FBAuth, deleteScream);




// users routs
app.post('/signup', signup);
app.post('/login', login );

app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser)


exports.api = functions.region('europe-west3').https.onRequest(app);


//if user Image changed, update all used references -> later for some sorts
exports.onUserImageChange = functions
  .region('europe-west3')
  .firestore.document('/users/{userId}')
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log('image has changed');
      const batch = db.batch();
      return db
        .collection('screams')
        .where('userHandle', '==', change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const scream = db.doc(`/screams/${doc.id}`);
            batch.update(scream, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onScreamDelete = functions
  .region('europe-west3')
  .firestore.document('/screams/{screamId}')
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db
      .collection('comments')
      .where('screamId', '==', screamId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection('likes')
          .where('screamId', '==', screamId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection('notifications')
          .where('screamId', '==', screamId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });