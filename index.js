//const PORT = 4000;
//const http = require("http"),
//    https = require('https');

const express = require('express');

const app = express();
const PORT = 16868;


const http = require("http"),
    https = require('https'),
    ftp = require('ftp'),

    dume=require('./mod/zkdog');


app.listen(PORT, () => {
    console.log(`API listening on PORT ${PORT} `)
})

//app.all('/', function (req, res, next) {
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header("Access-Control-Allow-Headers", "X-Requested-With");
//    next();
//});

//https://stackoverflow.com/questions/69822482/allow-cross-origins-in-nodejs
app.use('*', (req, res, next) => {
    // console.log({ message: 'in middleware' });
    /* req.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
    req.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
    req.headers['Access-Control-Allow-Headers'] =
      'Content-Type, Accept, Access-Control-Allow-Origin, Authorization'; */

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    next();
});

app.get('/zk/fio.php', (req, res) => {

    const c = new ftp(), f = req.query['l'] + '/' + req.query['f'],

        $secret = "Zk32charPasswordAndInitVectorftp", //must be 32 char length

        fU = JSON.parse( dume.DECRYPT_V1(req.query['g'], "AES-256-CBC", $secret, $secret.substr(0, 16)));

    c.on('ready', function () {

        c.get(f, function (err, RES) {

            if (err) throw err;

            RES.once('close', function () {

                c.delete(f, function (loi, xoa) {

                    c.end();

                });

             

            });
            //
            const chunks = [];
            RES.on('data', chunk => chunks.push(Buffer.from(chunk))) // Converte `chunk` to a `Buffer` object.
                .on('end', () => {
                    //
                    const buffer = Buffer.concat(chunks);
                    //
                    res.statusCode = 200;
                    //
                    res.end(buffer, "binary");
                    //
                });
        });
    });
    // connect to localhost:21 as anonymous
    c.connect({
        'host': req.query['h'],//'ftp.adrive.com',
        'user': fU[0],//'imhoatran3@gmail.com',
        'password': fU[1]// 'Hoatran3317@'
    });

})

app.get('/zk/furi.php', (req, res) => {



    console.log('dume');

    //const request = require('request');
    //request('http://zkteco.royalwebhosting.net/zk/f/furi_9148796').pipe(res);

    //res.send('Hey this is my API running 🥳 do cho chet')

    (async (url) => {

        var buf = await dume.httpGet(url, http, https);
        //res.writeHead(200, { 'content-type': "text/html" });
        //res.end(buf);
        //
        //res.statusCode = "200";
        //res.setHeader("Content-Type", "text/html");
        res.setHeader('Content-Length', buf.length);
        res.write(buf, 'binary');
        res.end();


    })(req.query['g'] + '://' + req.query['h'] + '/zk/fii.php?f=' + req.query['f']);//('http://zkteco.royalwebhosting.net/zk/f/furi_9148796');

})

app.get('/about', (req, res) => {
    res.send('This is my about route..... ')
})

// Export the Express API
module.exports = app