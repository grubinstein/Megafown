const express = require('express');
const router = express.Router();
const castController = require('../controllers/castController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get("/", (req, res) => {
  res.render('layout', {
    title: "Megafown"
  });
})

router.get("/speak", (req, res) => {
  res.render('speak', {
    title: "Speak"
  })
})

router.post('/api/new-cast', catchErrors(castController.newCast))

module.exports = router;