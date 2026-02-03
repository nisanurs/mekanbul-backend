var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Yorum ekleme rotası
router.post('/venues/:venueid/reviews', function(req, res) {
    // Burada gelen veriyi (req.body) alıp veritabanına kaydeden fonksiyonu çağırmalısın
    console.log("Gelen Yorum:", req.body);
    
    // Geçici olarak başarılı yanıt dönelim:
    res.status(201).json({ status: "success", data: req.body });
});

module.exports = router;
