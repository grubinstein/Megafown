const express = require('express');
const router = express.Router();
const castController = require('../controllers/castController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get(/^((?!\/assets\/).)*$/, (req, res) => {
  res.sendFile('/index.html', {
    root: 'public'
  })
})

router.post('/api/new-cast', catchErrors(castController.newCast))

module.exports = router;