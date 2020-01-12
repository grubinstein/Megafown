const express = require('express');
const router = express.Router();
const castController = require('../controllers/castController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get("/", (req, res) => {
  res.render('layout', {
    title: "Megafown"
  });
})

router.get("/speak", castController.speak);
router.get("/locationError", castController.locationError);
router.get("/streamError", castController.streamError);
router.get("/dataError", castController.dataError);

router.post('/api/new-cast', catchErrors(castController.createCast))
router.post('/api/end-cast', catchErrors(castController.endCast))

module.exports = router;