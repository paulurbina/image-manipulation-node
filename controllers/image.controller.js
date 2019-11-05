const ctrl = {}

const fs = require('fs')
const sharp = require('sharp')
const path = require('path')
const db = require('../config')


ctrl.uploadImage = async (req, res) => {
    db.query("INSERT INTO images SET ?", {
        name : req.params.name,
        size : req.body.length,
        data : req.body,
    }, (err) => {
        if (err) {
            return res.send({ status : "error", code: err.code });
        }

        res.send({ status : "ok", size: req.body.length });
    });
}

ctrl.donwloadImage = async (req, res) => {

        let image     = sharp(req.image.data);
        let width     = +req.query.width;
        let height    = +req.query.height;
        let blur      = +req.query.blur;
        let sharpen   = +req.query.sharpen;
        let greyscale = [ "y", "yes", "1", "on"].includes(req.query.greyscale);
        let flip      = [ "y", "yes", "1", "on"].includes(req.query.flip);
        let flop      = [ "y", "yes", "1", "on"].includes(req.query.flop);

        if (width > 0 && height > 0) {
            image.resize({ fit: 'fill' })
        }

        if (width > 0 || height > 0) {
            image.resize(width || null, height || null);
        }

        if (flip)        image.flip();
        if (flop)        image.flop();
        if (blur > 0)    image.blur(blur);
        if (sharpen > 0) image.sharpen(sharpen);
        if (greyscale)   image.greyscale();

        db.query("UPDATE images " +
             "SET date_used = UTC_TIMESTAMP " +
             "WHERE id = ?", [ req.image.id ]);

        res.setHeader("Content-Type", "image/" + path.extname(req.image.name).substr(1));

        image.pipe(res);

}

module.exports = ctrl