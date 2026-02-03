var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/venues/:venueid/reviews', function (req, res) {
  // Backend terminalinde verinin geldiğini görmek için:
  console.log("Yorum verisi ulaştı:", req.body);

  // React tarafındaki .then() bloğunun çalışması için bu yanıt şarttır:
  res.status(201).json({
    "status": "success",
    "message": "Yorum başarıyla kaydedildi"
  });
});
module.exports = router;