const { db, admin } = require('../util/admin');

const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators');

// Signup user
exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const { valid, errors } = validateSignupData(newUser);

  if(!valid) return res.status(400).json(errors);

  const noImg = 'no-img.jpg';

  let token, userId;
  db.doc(`/users/${newUser.handle}`).get()
    .then((doc) => {
      if(doc.exists){
        return res.status(400).json({handle: 'this handle is already taken'});
      }else{
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idtoken) => {
      token = idtoken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
        userId: userId
      }
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if(err.code === 'auth/email-already-in-use'){
        return res.status(400).json({ email: 'Email is already in use'});
      }else{
      return res.status(500).json({ error: err.code });
      }
    })
}

// Log user in
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }

  const { valid, errors } = validateLoginData(user);

  if(!valid) return res.status(400).json(errors);

  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({token});
    })
    .catch(err => {
      console.error(err);
      if(err.code === 'auth/wrong-password'){
        return res.status(403).json({general: 'Wrong credentials, please try again'});
      }else{
      return res.status(500).json({error: err.code});
      }
    })
}

// Upload a profile image for user
exports.uploadImage = (req, res) => {
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if(mimetype !== 'image/jpeg' && mimetype !== 'image/png'){
      return res.status(400).json({error: 'Wrong file type submitted!'});
    }

    console.log( fieldname );
    console.log(filename);
    console.log( mimetype );
    const imageExtension = filename.split('.')[filename.split('.').length - 1]; // get .png 
    imageFileName = `${Math.round(Math.random() * 10000000000)}.${imageExtension}`; // sets filename like 134562424.png
    const filePath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filePath, mimetype };

    file.pipe(fs.createWriteStream(filePath));

  });
  busboy.on('finish', () => {
    admin.storage().bucket().upload(imageToBeUploaded.filePath, {
      resumable: false,
      metadata: {
        metadata: {
          contentType: imageToBeUploaded.mimetype
        }
      }
    })
    .then(() => {
      // add image url to our user
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`
      return db.doc(`/users/${req.user.handle}`).update({ imageUrl: imageUrl});
    })
    .then(() => {
      return res.json({message: 'Image uploaded successfully'})
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    })
  });
  busboy.end(req.rawBody);
};

// Add user details
exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);
  db.doc(`/users/${req.user.handle}`).update(userDetails)
    .then(() => {
      return res.json({message: 'Details added successfully'});
    })
    .catch(() => {
      console.error(err);
      return res.status(500).json({error: err.code});
    });
}