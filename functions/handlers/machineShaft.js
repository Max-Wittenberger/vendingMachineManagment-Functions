const { db } = require('../util/admin');


//Post a vending machine
exports.createShaft = (req, res) => {
  const newShaft = {
    articleId: req.body.articleId,
    createdAt: new Date().toISOString(),
    height: req.body.height,
    place: req.body.place,
    vendingMachineId: req.body.vendingMachineId,
  };

  db.collection('shafts')
    .add(newShaft)
    .then((doc) => {
      newShaft.shaftId = doc.id;
      res.json(newShaft); 
    })
    .then(() => {
      db.doc(`/vendingMachines/${newShaft.vendingMachineId}`).get()
        .then((doc) => {
          if (!doc.exists) {
            return res.status(404).json({ error: 'Vending machine not found' });
          }
          let shafts = doc.data().shafts;
          shafts.push(newShaft.shaftId);
          return doc.ref.update({ shafts: shafts });
        })
        .catch((err) => {
          res.status(500).json({ error: 'something went wrong' });
          console.error(err);
        }); 
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    }); 

  

};
