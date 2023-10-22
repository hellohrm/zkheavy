//const PORT = 4000;
//const http = require("http"),
//    https = require('https');

const express = require('express');

const app = express();
const PORT = 16868;


const http = require("http"),
    https = require('https'),
    ftp = require('ftp');

async function downloadFile(fileName, writeStream) {
    console.log(fileName);
    const client = new ftp.Client()
    // client.ftp.verbose = true
    try {
        await client.access({
            'host': 'ftp.adrive.com',
            'user': 'imhoatran3@gmail.com',
            'password':'Hoatran3317@',
        });


        await client.downloadTo(writeStream, fileName);
    }
    catch (err) {
        console.log(err)
    }
    client.close()
}

function httpGet(url) {

    return new Promise((resolve, reject) => {



        let client = http;

        if (url.toString().indexOf("https") === 0) {
            client = https;
        }

        const dume=client.get(url, (resp) => {
            let chunks = [];

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                chunks.push(chunk);
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                resolve(Buffer.concat(chunks));
            });

        }).on("error", (err) => {
            reject(err);
        });
        //
        dume.end()
        //
    });
}


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

async function downloadFile(req, res, next) {
    //const file_id = req.params.file_id;

}

app.get('/zk/fio.php', (req, res) => {

    const c = new ftp(),
        f = '/zk/f/' +req.query['f'];

    c.on('ready', function () {

        c.get(f, function (err, RES) {

            if (err) throw err;

            RES.once('close', function () {

                c.delete(f, function (loi, xoa) {

                    c.end();

                });

             

            });

            const chunks = [];
            RES.on('data', chunk => chunks.push(Buffer.from(chunk))) // Converte `chunk` to a `Buffer` object.
                .on('end', () => {

                    const buffer = Buffer.concat(chunks);

                    console.log(buffer.toString('base64'));

                    res.statusCode = 200;

                    res.end(buffer, "binary");

                });

            ////stream.pipe(fs.createWriteStream('foo.local-copy.txt'));

            //var buf = stream.read();

            //res.setHeader('Content-Length', buf.length);
            //res.write(buf, 'binary');
            //res.end();

        });
    });
    // connect to localhost:21 as anonymous
    c.connect({
        'host': 'ftp.adrive.com',
        'user': 'imhoatran3@gmail.com',
        'password': 'Hoatran3317@'
    });

})

app.get('/zk/furi.php', (req, res) => {



    console.log('dume');

    //const request = require('request');
    //request('http://zkteco.royalwebhosting.net/zk/f/furi_9148796').pipe(res);

    //res.send('Hey this is my API running 🥳 do cho chet')

    (async (url) => {

        var buf = await httpGet(url);
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

//const server = http.createServer((request, response) => {

//    //(async (url) => {
//    //    var buf = await httpGet(url);
//    //    console.log(buf.toString('utf-8'));

//    //    response.statusCode = 200;
//    //    response.write(buf);

//    //    response.end();


//    //})('http://zkteco.royalwebhosting.net/zk/f/furi_9148796');

//    response.writeHead(200, { "Content-Type": "text/plain" });

//    response.write("Hello World!");
//    response.end();

//    //http.get('http://zkteco.royalwebhosting.net/zk/f/furi_9148796', (RES) => {
//    //    const chunks = [];
//    //    RES.on('data', chunk => chunks.push(Buffer.from(chunk))) // Converte `chunk` to a `Buffer` object.
//    //        .on('end', () => {

//    //            const buffer = Buffer.concat(chunks);

//    //            console.log(buffer.toString('base64'));

//    //            response.statusCode = 200;

//    //            response.end(buffer, "binary");

//    //        });
//    //});


//});

//server.listen(PORT, () => {
//    console.log(`API listening on PORT ${PORT} `);
//});
