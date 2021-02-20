const { db } = require('../util/admin');

//TODO get only with accessCode
exports.getAllVendingMachines = (req, res) => {
  db.collection('vendingMachines')
    .orderBy('lastUpdated', 'desc')
    .get()
    .then((data) => {
      let vendingMachines = [];
      data.forEach((doc) => {
        vendingMachines.push({
          vendingMachineId: doc.id,
          createdAt: doc.data().createdAt,
          category: doc.data().category,
          hardwareId: doc.data().hardwareId,
          lastUpdated: doc.data().lastUpdated,
          location: doc.data().location,
          shafts: doc.data().shafts
        });
      });
      return res.json(vendingMachines);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};


// Fetch one vendingMachine
exports.getVendingMachine = (req, res) => {

  console.log(req.params.vendingMachineId);
    let vendingMachineData = {};
    let articleIds = [];
    db.doc(`/vendingMachines/${req.params.vendingMachineId}`)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return res.status(404).json({ error: 'Vending machine not found' });
        }
        vendingMachineData = doc.data();
        vendingMachineData.vendingMachineId = doc.id;
        return db.collection('shafts')
          .orderBy('place', 'asc')
          .where('vendingMachineId', '==', req.params.vendingMachineId)
          .get();
      })
      .then((data) => {
        vendingMachineData.shafts = [];
          data.forEach((doc) => {
            const shaft = doc.data()
            vendingMachineData.shafts.push(shaft);
            articleIds.push( shaft.articleId );
          });  
        // hier alle articlenummern returnen, die gesucht werden sollen        
        if(articleIds.length > 0){
    	  return db.collection("articles").where("articleId" , "in", articleIds).get();
        }else return res.json(vendingMachineData);
      }).then((data) => {
        data.forEach((doc) => {
          const article = doc.data();
          console.log(article);
          for(let shaft of vendingMachineData.shafts){
            if(shaft.articleId === article.articleId){
              shaft.article = article;
            };
          }
        });
        return res.json(vendingMachineData);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      });   

        
  };
  
  const getArticleData = (articleId) => {
   return db.doc(`articles/${articleId}`).get()
          .then((doc) => { 
              return doc.data()
            }); 
  }


//Post a vending machine
exports.createVendingMachine = (req, res) => {
  const newVendingMachine = {
    // accessCode: req.user.accessCode,
    category: req.body.category,
    createdAt: new Date().toISOString(),
    hardwareId: req.body.hardwareId,
    city: req.body.city,
    country: req.body.country,
    streetname: req.body.streetname,
    streetno: req.body.streetno,
    lastUpdated: 0,
    shafts: 0
  };

  db.collection('vendingMachines')
    .add(newVendingMachine)
    .then((doc) => {
      const resVendingMachine = newVendingMachine;
      resVendingMachine.vendingMachineId = doc.id;
      res.json(resVendingMachine);
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    }); 
};

// Comment on a comment
exports.addVendingMachineShaft = (req, res) => {
 /* if (req.body.body.trim() === '')
    return res.status(400).json({ comment: 'Must not be empty' });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };
  console.log(newComment);

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Something went wrong' });
    }); */
};


// Delete a vendingMachine
exports.deleteVendingMachine = (req, res) => {
 /* const document = db.doc(`/screams/${req.params.screamId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: 'Unauthorized' });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: 'Scream deleted successfully' });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    }); */
};