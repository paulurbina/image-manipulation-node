const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const express = require("express");
const sharp   = require("sharp");
const app     = express();

const db = require('./config')

    /**
 * imports controllers
 */
const { uploadImage, donwloadImage } = require('./controllers/image.controller')
const { stats } = require('./controllers/stats.controller')

app.post("/uploads/:name", bodyParser.raw({
    limit : "10mb",
    type : "image/*"
}), uploadImage);


app.param('width', (req, res, next, width) => {
    req.width = +width

    return next()
})

app.param('height', (req, res, next, height) => {
    req.height = +height

    return next()
})

app.param("greyscale", (req, res, next, greyscale) => {
    if (greyscale != "bw") return next("route");

    req.greyscale = true;

    return next();
});

app.head('/uploads/:image', (req, res) => {
    res.status(200).end()
})

/**
 * Ruta de descarga 
 */
app.get('/uploads/:image', donwloadImage)

/**
 * Eliminar una imagen
 */
app.delete('/uploads/:image', (req, res) => {
    db.query("DELETE FROM images WHERE id = ?", [ req.image.id ], (err) => {
        return res.status(err ? 500 : 200).end()
    })
})

/**
 * rutas de estadisticas
 */
app.get('/stats', stats)

app.param('image', (req, res, next, image) => {
    if (!image.match(/\.(png|jpg)$/i)) {
        return res.status(403).end();
    }

    db.query("SELECT * FROM images WHERE name = ?", [ image ], (err, images) => {
        if (err || !images.length) {
            return res.status(404).end();
        }

        req.image = images[0];

        return next();
    });
})


app.get(/\/thumbnail\.(jpg|png)/, (req, res, next) => {
    let format    = (req.params[0] == "png" ? "png" : "jpeg");
    let width     = +req.query.width || 300;
    let height    = +req.query.height || 200;
    let border    = +req.query.border || 5;
    let bgcolor   = req.query.bgcolor || "#fcfcfc";
    let fgcolor   = req.query.fgcolor || "#ddd";
    let textcolor = req.query.textcolor || "#aaa";
    let textsize  = +req.query.textsize || 24;
    let image     = sharp({
        create : {
            width      : width,
            height     : height,
            channels   : 4,
            background : { r: 0, g: 0, b: 0 },
       }
    })
  
    const thumbnail = Buffer.from(
`<svg width="${width}" height="${height}">
    <rect
        x="0" y="0"
        width="${width}" height="${height}"
        fill="${fgcolor}" />
    <rect
        x="${border}" y="${border}"
        width="${width - border * 2}" height="${height - border * 2}"
        fill="${bgcolor}" />
    <line
        x1="${border * 2}" y1="${border * 2}"
        x2="${width - border * 2}" y2="${height - border * 2}"
        stroke-width="${border}" stroke="${fgcolor}" />
    <line
        x1="${width - border * 2}" y1="${border * 2}"
        x2="${border * 2}" y2="${height - border * 2}"
        stroke-width="${border}" stroke="${fgcolor}" />
    <rect
        x="${border}" y="${(height - textsize) / 2}"
        width="${width - border * 2}" height="${textsize}"
        fill="${bgcolor}" />
    <text
        x="${width / 2}" y="${height / 2}" dy="8"
        font-family="Helvetica" font-size="${textsize}"
        fill="${textcolor}" text-anchor="middle">${width} x ${height}</text>
</svg>`
    );

image.composite([{
        input: thumbnail
    }])[format]().pipe(res);
});

setInterval(() => {
    db.query("DELETE FROM images " +
             "WHERE (date_created < UTC_TIMETSTAMP - INTERVAL 1 WEEK AND date_used IS NULL) " +
             " OR (date_used < UTC_TIMETSTAMP - INTERVAL 1 MONTH)");
}, 3600 * 1000);

app.listen(3000, () => {
    console.log("ready");
});
