var mongoose = require('mongoose');
var Venue = mongoose.model('venue');

// Yardımcı fonksiyon: Basitleştirilmiş yanıt gönderme
const createResponse = function (res, status, content) {
    res.status(status).json(content);
};

// [1] Puan Hesaplama Metodu (calculateLastRating) - ASYNC ZORUNLU
var calculateLastRating = async function (incomingVenue, isDeleted) {
    var i,
        numComments,
        avgRating,
        sumRating = 0;

    // Yorum sayısını al
    numComments = incomingVenue.comments ? incomingVenue.comments.length : 0;

    if (incomingVenue.comments) {
        if (numComments == 0 && isDeleted) {
            avgRating = 0;
        } else if (numComments > 0) {
            for (i = 0; i < numComments; i++) {
                // rating alanının geçerli olduğundan emin olun
                sumRating = sumRating + (incomingVenue.comments[i].rating || 0);
            }
            // Ortalama puanı yukarı yuvarla
            avgRating = Math.ceil(sumRating / numComments);
        } else {
            avgRating = incomingVenue.rating || 0;
        }

        // Mekan modelini güncelle ve KAYDET (await zorunlu)
        incomingVenue.rating = avgRating;
        await incomingVenue.save(); // <<< KRİTİK: ASYNC/AWAIT DÜZELTMESİ
    }
};

// [2] Puan Güncelleme Metodu (updateRating) - ASYNC ZORUNLU DÜZELTME
var updateRating = function (venueid, isDeleted) {
    Venue.findById(venueid)
        .select("rating comments")
        .exec()
        .then(async function (venue) { // <<< ASYNC KEYWORD'Ü EKLEDİK
            if (venue) {
                await calculateLastRating(venue, isDeleted); // <<< AWAIT EKLEDİK
            }
        })
        .catch(error => {
            console.error("Puan güncelleme hatası:", error);
        });
};


// [3] Yorum Ekleme Metodu (addComment)
const addComment = function (req, res) {
    // 1. Veri Kontrolü (Model modelinin beklediği 'text' alan adı kullanılmalı)
    if (!req.params.venueid || !req.body.author || !req.body.rating || !req.body.text) {
        createResponse(res, 400, { "message": "Yorum verileri (author, rating, text) eksik." });
        return;
    }

    // 2. Mekan Arama ve Yorum Ekleme
    Venue.findById(req.params.venueid)
        .select('comments')
        .exec()
        .then(function (venue) {
            if (!venue) {
                createResponse(res, 404, { "message": "Mekan bulunamadı." });
                return;
            }

            const addedComment = {
                author: req.body.author,
                rating: parseInt(req.body.rating, 10),
                text: req.body.text, // <<< KRİTİK: 'commentText' yerine 'text' kullanıldı
                date: new Date()
            };

            venue.comments.push(addedComment);

            // 3. Kaydetme ve Puan Güncelleme
            venue.save()
                .then(function (result) {
                    updateRating(result._id, false);
                    createResponse(res, 201, result.comments[result.comments.length - 1]);
                })
                .catch(function (err) {
                    createResponse(res, 400, err);
                });
        })
        .catch(function (err) {
            createResponse(res, 404, err);
        });
};


// [4] Yorum Okuma Metodu (getComment)
const getComment = function (req, res) {
    if (req.params.venueid && req.params.commentid) {
        Venue.findById(req.params.venueid)
            .select('name comments')
            .exec()
            .then(function (venue) {
                const comment = venue.comments.id(req.params.commentid);
                if (!venue) {
                    createResponse(res, 404, {
                        "message": "Mekan bulunamadı."
                    });
                    return;
                }
                if (!comment) {
                    createResponse(res, 404, {
                        "message": "Yorum bulunamadı."
                    });
                    return;
                }
                createResponse(res, 200, comment);
            })
            .catch(function (err) {
                createResponse(res, 404, { "message": err });
            });
    } else {
        createResponse(res, 404, {
            "message": "bulunamadi, venueid ve commentid gerekli"
        });
    }
};

// [5] Yorum Güncelleme Metodu (updateComment)
const updateComment = function (req, res) {
    if (!req.params.venueid || !req.params.commentid || !req.body.author || !req.body.rating || !req.body.text) {
        createResponse(res, 400, { "message": "Yorum verileri (author, rating, text) eksik." });
        return;
    }

    Venue.findById(req.params.venueid)
        .select('comments')
        .exec()
        .then(function (venue) {
            if (!venue) {
                createResponse(res, 404, { "message": "Mekan bulunamadı." });
                return;
            }

            const comment = venue.comments.id(req.params.commentid);

            if (!comment) {
                createResponse(res, 404, { "message": "Yorum bulunamadı." });
                return;
            }

            comment.author = req.body.author;
            comment.rating = parseInt(req.body.rating, 10);
            comment.text = req.body.text; // Model uyumu

            venue.save()
                .then(function (result) {
                    updateRating(result._id, false);
                    createResponse(res, 201, comment);
                })
                .catch(function (err) {
                    createResponse(res, 400, err);
                });
        })
        .catch(function (err) {
            createResponse(res, 500, err);
        });
};


// [6] Yorum Silme Metodu (deleteComment)
const deleteComment = function (req, res) {
    if (!req.params.venueid || !req.params.commentid) {
        createResponse(res, 400, { "message": "venueid ve commentid gerekli." });
        return;
    }

    Venue.findById(req.params.venueid)
        .select('comments')
        .exec()
        .then(function (venue) {
            if (!venue) {
                createResponse(res, 404, { "message": "Mekan bulunamadı." });
                return;
            }

            const comment = venue.comments.id(req.params.commentid);

            if (!comment) {
                createResponse(res, 404, { "message": "Yorum bulunamadı." });
                return;
            }

            comment.remove();

            venue.save()
                .then(function (result) {
                    updateRating(result._id, true); // true, silme işlemi olduğunu belirtir
                    createResponse(res, 200, { "message": "Yorum başarıyla silindi." });
                })
                .catch(function (err) {
                    createResponse(res, 400, err);
                });
        })
        .catch(function (err) {
            createResponse(res, 500, err);
        });
};


module.exports = {
    addComment,
    getComment,
    updateComment,
    deleteComment
};