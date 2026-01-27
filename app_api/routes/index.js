var express = require('express');
var router = express.Router();
var ctrlVenues = require('../controller/VenueController');
var ctrlComments = require('../controller/CommentController');

// MEKANLAR (VENUES)
router.get('/venues', ctrlVenues.listVenues);
router.post('/venues', ctrlVenues.addVenue);
router.get('/venues/:venueid', ctrlVenues.getVenue);
router.put('/venues/:venueid', ctrlVenues.updateVenue); // Güncelleme için
router.delete('/venues/:venueid', ctrlVenues.deleteVenue); // SİLME ROTASI BURADA OLMALI

// YORUMLAR (COMMENTS)
router.post('/venues/:venueid/comments', ctrlComments.addComment);
router.get('/venues/:venueid/comments/:commentid', ctrlComments.getComment);
router.delete('/venues/:venueid/comments/:commentid', ctrlComments.deleteComment); // Yorum silme

module.exports = router;