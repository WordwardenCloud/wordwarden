var express = require('express');
var router = express.Router();

const {mistral} = require('../modules/mistral.js')
const {openai} = require('../modules/openai.js')
const {gemini} = require('../modules/gemini.js')


router.post('/mistral/:assistant', async (req, res, next) => {

  const { input } = req.body
  const { assistant } = req.params

  try {
      
      const result = await mistral(assistant, input);
        
      res.json(result);

  } catch (error) {
      next(error);
  }
});

router.post('/openai', async (req, res, next) => {

  const { input, assistants } = req.body;


  try {

    let results = {}

    for (const assistant of assistants) {

      console.log('calling: ' + assistant)
      
      const answer = await openai(assistant, input);

      const filteredAnswer = answer[assistant].filter(item => item.importance >= 8);

      results[assistant] = filteredAnswer

    }
    
    res.json(results);

  } catch (error) {

    next(error);

  }
});

router.post('/gemini', async (req, res, next) => {

  const { input, assistants } = req.body;


  try {

    let results = {}

    for (const assistant of assistants) {

      console.log('calling: ' + assistant)
      
      const answer = await gemini(assistant, input);

      console.log(answer)

      const filteredAnswer = answer[assistant].filter(item => item.importance >= 8);

      results[assistant] = filteredAnswer

    }
    console.log(results)
    res.json(results);

  } catch (error) {

    next(error);

  }
});

module.exports = router;