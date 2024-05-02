const express = require("express");
var router = express.Router();

const { db } = require("../firebase")

// GET : get all notes from user
router.get("/byuser/:uid", async (req, res)=>{

  try {

    const snapshot =  await db.collection('notes').where('user', '==', req.params.uid).get();

    if (snapshot.empty) {

      return res.status(404).json({ message: 'User has not created notes yet.' })
    
    }  
    
    let notes = []
   
    snapshot.forEach(doc => {
      const data = doc.data();
      notes.push({
        id: doc.id, 
        ...data
      });
    });

    return res.status(200).json(notes)
    
  } catch (error) {

    console.error(error);
    return res.status(500).json({ error });
    
  }
})

// POST : save and update note
router.post("/save/:uid/:id", async (req, res) => {

  const date = new Date();
  
  const note = {
    title: req.body.title,
    content: req.body.content,
    user: req.params.uid,
    localModel: req.body.localModel,
    lastModified: date
  }

  try {

    await db.collection('notes').doc(req.params.id).set(note, {merge:true})

    return res.status(200).json({ message: "Your note was correctly saved" });
    
  } catch (error) {

    console.error(error);
    return res.status(500).json({ error });
    
  }
});

// GET : retrieve single note
router.get("/retrieve/:uid/:id", async (req, res) => {
  
  const noteRef = db.collection('notes').doc(req.params.id);

  try {

    const doc = await noteRef.get();

    if (!doc.exists) {
      console.log('No such note!');
      return res.status(400);
    }

    if (doc.exists && doc.data().user !== req.params.uid) {
      return res.status(403).json({ message: "User can't access this note." })
    }      
      
    return res.status(200).json(doc.data())
    
  } catch(error) {

    console.error(error);
    return res.status(500).json({ error });

  }

})

// DELETE : delete single note
router.delete("/delete/:uid/:id",async (req, res)=>{
  
  try {
    
    const response = await db.collection('notes').doc(req.params.id).delete();

    return res.status(200).json({ response });

  } catch (error) {
   
    console.error(error);
    return res.status(500).json({ error });

  }

})


module.exports = router