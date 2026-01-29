var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
var express = require('express');
var router = express.Router();
var ctrlVenues = require('../controller/VenueController'); // Controller yolun

// Buradaki ":venueid" ismi, Controller'daki "req.params.venueid" ile AYNI olmalı
router.get('/venues/:venueid', ctrlVenues.getVenue);
router.get('/venues', ctrlVenues.listVenues);
router.post('/venues', ctrlVenues.addVenue);
router.delete('/venues/:venueid', ctrlVenues.deleteVenue);

module.exports = router;