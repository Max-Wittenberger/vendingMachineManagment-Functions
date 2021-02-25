const { user } = require('firebase-functions/lib/providers/auth');
const { db } = require('../util/admin');

exports.getArticleData = (req, res) => {
  let articleData = {};
  return db.doc(`/articles/${req.params.articleId}`)
         .get()
         .then((doc) => { 
            if (!doc.exists) {
                return res.status(404).json({ error: 'Article not found' });
            }         
            articleData = doc.data();
            articleData.articleId = doc.id;

            return res.json(articleData);
           })
         .catch((err) => {
             console.error(err);
             res.status(500).json({ error: err.code });
           }); 
 }

exports.createArticle = (req, res) => {
  if (req.body.description.trim() === '') {
    return res.status(400).json({ body: 'Description must not be empty' });
  }

  const newArticle = {
    accessCode: req.user.accessCode,
    description: req.body.description,
    height: req.body.height,
    price: req.body.price,
    imageUrl: req.body.imageUrl,
  }

  db.collection('articles')
    .add(newArticle)
    .then((doc) => {
      const resNewArticle = newArticle;
      resNewArticle.articleId = doc.id;
      res.json(resNewArticle);
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    });
  }

exports.updateArticle = (req, res) => {  
    const updateArticle = {
      description: req.body.description,
      height: req.body.height,
      price: req.body.price,
      imageUrl: req.body.imageUrl
    }
  
    db.doc(`/articles/${req.params.articleId}`)
      .update(updateArticle)
      .then((doc) => {
        const resUpdateArticle = updateArticle;
        resUpdateArticle.articleId = doc.id;
        res.json(resUpdateArticle);
      })
      .catch((err) => {
        res.status(500).json({ error: 'something went wrong' });
        console.error(err);
      });
    }

exports.getAllArticles = (req, res) => {
  db.collection('articles')
  .get()
  .then((data) => {
    let vendingMachines = [];
    data.forEach((doc) => {
      data = doc.data();
      vendingMachines.push({
        accessCode: data.accessCode,
        articleId: doc.id,
        description: data.description,
        height: data.height,
        price: data.price,
        imageUrl: data.imageUrl,
      });
    });
    res.json(vendingMachines);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({ error: err.code });
  });
}
