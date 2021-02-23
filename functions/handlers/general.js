const { admin, db } = require("../util/admin");

const config = require("../util/config");
const { uuid } = require("uuidv4");



// Upload a profile image for user
exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
   const path = require("path");
   const os = require("os");
   const fs = require("fs");
 
   const busboy = new BusBoy({ headers: req.headers });
 
   let imageToBeUploaded = {};
   let imageFileName;
   // String for image token
   let generatedToken = uuid();
 
   busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
     console.log(fieldname, file, filename, encoding, mimetype);
     if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
       return res.status(400).json({ error: "Wrong file type submitted" });
     }
     // my.image.png => ['my', 'image', 'png']
     const imageExtension = filename.split(".")[filename.split(".").length - 1];
     // 32756238461724837.png
     imageFileName = `${Math.round(
       Math.random() * 1000000000000
     ).toString()}.${imageExtension}`;
     const filepath = path.join(os.tmpdir(), imageFileName);
     imageToBeUploaded = { filepath, mimetype };
     file.pipe(fs.createWriteStream(filepath));
   });
   busboy.on("finish", () => {
     admin
       .storage()
       .bucket()
       .upload(imageToBeUploaded.filepath, {
         resumable: false,
         metadata: {
           metadata: {
             contentType: imageToBeUploaded.mimetype,
             //Generate token to be appended to imageUrl
             firebaseStorageDownloadTokens: generatedToken,
           },
         },
       })
       .then(() => {
         // Append token to url
         const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media&token=${generatedToken}`;
        //  return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
         return res.json({ imageUrl });
       })
       .catch((err) => {
         console.error(err);
         return res.status(500).json({ error: "something went wrong" });
       });
   });
   busboy.end(req.rawBody); 
 };