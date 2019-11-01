const ctrl = {}

const fs = require('fs')
const sharp = require('sharp')
const path = require('path')

ctrl.uploadImage = async (req, res) => {
    let image = req.params.image.toLowerCase();

    if(!image.match(/\.(png|jpg)$/)) {
        return res.status(403).end()
    }

    let fd = await fs.createWriteStream(req.localpath, {
        flags: 'w+',
        encoding: 'binary'
    })

    fd.end(req.body)

    fd.on('close', () => {
        res.send({ status: "ok", size: req.body.length })
    })
}

ctrl.donwloadImage = async (req, res) => {

    fs.access(req.localpath, fs.constants.R_OK , (err) => {
        if (err) return res.status(404).end();

        let image     = sharp(req.localpath);
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

        res.setHeader("Content-Type", "image/" + path.extname(req.image).substr(1));

        image.pipe(res);
    });

}

module.exports = ctrl