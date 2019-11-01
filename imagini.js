const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const express = require("express");
const sharp   = require("sharp");
const app     = express();

/**
 * imports controllers
 */
const { uploadImage, donwloadImage } = require('./controllers/image.controller')

app.post('/uploads/:image', bodyParser.raw({
    limit: '10mb',
    type: 'image/*'
}), uploadImage )


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


//  app.get("/uploads/:width(\\d+)x:height(\\d+)-:greyscale-:image", download_image);
//  app.get("/uploads/:width(\\d+)x:height(\\d+)-:image", download_image);
//  app.get("/uploads/_x:height(\\d+)-:greyscale-:image", download_image);
//  app.get("/uploads/_x:height(\\d+)-:image", download_image);
//  app.get("/uploads/:width(\\d+)x_-:greyscale-:image", download_image);
//  app.get("/uploads/:width(\\d+)x_-:image", download_image);
//  app.get("/uploads/:greyscale-:image", download_image);
//  app.get("/uploads/:image", download_image);


app.head('/uploads/:image', (req, res) => {
    fs.access(req.localpath, fs.constants.R_OK, (err) => {
            res.status(err ? 404 : 200)
            res.end()
        }
    )
})

/**
 * Ruta de descarga 
 */
app.get('/uploads/:image', donwloadImage

    // let fd = fs.createReadStream(req.localpath)

    // fd.on('error', (e) => {
    //     res.status(e.code === 'ENOENT' ? 404 : 500).end()
    // })
    // res.setHeader('Content-Type', 'image/' + path.extname(req.image).substr(1))

    // fd.pipe(res)
)

app.param('image', (req, res, next, image) => {
    if (!image.match(/\.(png|jpg)$/i)) {
        return res.status(req.method == "POST" ? 403 : 404).end();
    }

    req.image     = image
    req.localpath = path.join(__dirname, 'uploads', req.image)

    return next()
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

app.listen(3000, () => {
    console.log("ready");
});

/**
 * funcion podra manejar el cambio de tamaño opcional
 */

// function download_image(req, res) {
//     fs.access(req.localpath, fs.constants.R_OK, (err) => {
//         if (err) return res.status(404).end()

//         let image = sharp(req.localpath)
//         let width = +req.query.width
//         let height = +req.query.height
//         let greyscale = (req.query.greyscale == 'yes')

//         if(width > 0 && height > 0) {
//             image.resize({ fit: 'fill' })
//         }

//         if(width > 0 || height > 0) {
//             image.resize(width || null, height || null)
//         }

//         if(greyscale) {
//             image.greyscale()
//         }

//         res.setHeader('Content-Type', 'image/' + path.extname(req.image).substr(1))

//         image.pipe(res)
//     })
// }

/**
* Fin de la funcion podra manejar el cambio de tamaño opcional
*/


