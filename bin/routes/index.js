var express = require('express');
var router = express.Router();
var ctrlVenues = require('../controller/VenueController'); // Bu dosya adının doğru olduğundan emin olun
var ctrlComments = require('../controller/CommentController'); // Bu dosya adının doğru olduğundan emin olun


// MEKANLAR (VENUES)
router
  .route('/venues')
  .get(ctrlVenues.listVenues)
  .post(ctrlVenues.addVenue);

router
  .route('/venues/:venueid')
  .get(ctrlVenues.getVenue)
  .put(ctrlVenues.updateVenue)
  .delete(ctrlVenues.deleteVenue);

// YORUMLAR (COMMENTS)
router
  .route('/venues/:venueid/comments') // <<< YORUM EKLEME ROTASI
  .post(ctrlComments.addComment);

router
  .route('/venues/:venueid/comments/:commentid') // <<< TEKİL YORUM İŞLEMLERİ
  .get(ctrlComments.getComment)
  .put(ctrlComments.updateComment)
  .delete(ctrlComments.deleteComment);

module.exports = router;