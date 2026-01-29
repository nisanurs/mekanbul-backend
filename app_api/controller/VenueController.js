var mongoose = require('mongoose');
var Venue = mongoose.model('venue');

// Yardımcı fonksiyon: Ortak cevap oluşturma
const createResponse = function (res, status, content) {
    res.status(status).json(content);
};

const listVenues = async function (req, res) {
    // 1. URL'den gelen lat ve long değerlerini alıyoruz (Örn: ?lat=40.1&long=29.1)
    const lat = parseFloat(req.query.lat);
    const long = parseFloat(req.query.long);

    // Koordinatlar gelmemişse hata verme, normal listele (Opsiyonel)
    if (!lat || !long) {
        const venues = await Venue.find().exec();
        return createResponse(res, 200, venues);
    }

    try {
        // 2. Coğrafi hesaplama yapıyoruz
        const venues = await Venue.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [long, lat] }, // Önce Longitude sonra Latitude!
                    distanceField: "distance", // Hesaplanan mesafeyi bu isimle objeye ekler
                    spherical: true, // Dünyanın yuvarlaklığını hesaba kat
                    distanceMultiplier: 0.001 // Metreyi Kilometreye çevir
                }
            }
        ]);
        createResponse(res, 200, venues);
    } catch (err) {
        console.error("Listeleme Hatası:", err);
        createResponse(res, 500, { "message": "Mesafe hesaplanırken hata oluştu." });
    }
};

// [2] Yeni Mekan Ekle
const addVenue = async function (req, res) {
    try {
        const response = await Venue.create({
            name: req.body.name,
            address: req.body.address,
            rating: req.body.rating,
            foodanddrink: req.body.foodanddrink ? req.body.foodanddrink.split(',') : [],
            // Koordinatları sayıya çeviriyoruz
            coordinates: [parseFloat(req.body.lat), parseFloat(req.body.long)],
            hours: [
                {
                    days: req.body.days1,
                    open: req.body.open1,
                    close: req.body.close1,
                    isClosed: req.body.isClosed1 === "true"
                },
                {
                    days: req.body.days2,
                    open: req.body.open2,
                    close: req.body.close2,
                    isClosed: req.body.isClosed2 === "true"
                }
            ]
        });
        createResponse(res, 201, response);
    } catch (error) {
        console.error("Mekan Ekleme Hatası:", error);
        createResponse(res, 400, { "message": "Mekan eklenemedi, verileri kontrol edin.", "error": error });
    }
};

// [3] Tek Bir Mekanı Getir
const getVenue = async function (req, res) {
    try {

        const venue = await Venue.findById(req.params.venueid).exec();
        if (!venue) {
            createResponse(res, 404, { "message": "Mekan bulunamadı." });
            return;
        }
        createResponse(res, 200, venue);
    } catch (err) {
        createResponse(res, 404, { "message": "ID hatası veya mekan yok." });
    }
};
// [4] Mekan Güncelle 
const updateVenue = async function (req, res) {
    createResponse(res, 200, { "status": "Güncelleme özelliğini yakında ekleyeceğim." });
};

// [5] Mekan Sil
const deleteVenue = async function (req, res) {
    const { venueid } = req.params;
    try {
        const venue = await Venue.findByIdAndDelete(venueid).exec();

        if (!venue) {
            createResponse(res, 404, { "message": "Mekan bulunamadı, silme başarısız." });
            return;
        }
        //genelde 204 kullanılır (sildigimiz icin artik yok diyerek)
        createResponse(res, 200, { "status": "Mekan başarıyla silindi", "silinen": venue.name });

    } catch (err) {
        console.error("Silme Hatası:", err);
        createResponse(res, 404, { "message": "Geçersiz mekan ID'si." });
    }
};


module.exports = {
    listVenues,
    addVenue,
    getVenue,
    updateVenue,
    deleteVenue
};