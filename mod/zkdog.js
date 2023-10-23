'use strict';

const CRYPTO = require('crypto'),//https://stackoverflow.com/questions/19934422/encrypt-string-in-php-and-decrypt-in-node-js
    encryptionMethod = 'AES-256-CBC',
    SECRET = "My32charPasswordAndInitVectorStr", //must be 32 char length
    iv = SECRET.substr(0, 16);

function DECRYPT_V1(enMsg, _med, _secr, _iv) {

    if (!_med) _med = encryptionMethod;

    var decryptor = CRYPTO.createDecipheriv(_med, _secr, _iv);

    return decryptor.update(enMsg, 'hex', 'utf8') + decryptor.final('utf8');

};

async function downloadFile(fileName, writeStream) {
    console.log(fileName);
    const client = new ftp.Client()
    // client.ftp.verbose = true
    try {
        await client.access({
            'host': 'ftp.adrive.com',
            'user': 'imhoatran3@gmail.com',
            'password': 'Hoatran3317@',
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

        const dume = client.get(url, (resp) => {
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

module.exports = {
    DECRYPT_V1,
    downloadFile,
    httpGet
};

























//// file: index.js
//var express = require('express');
//var app = express();
//var child = require('./child');
//app.use('/child', child);
//app.get('/', function (req, res) {
//    res.send('parent');
//});
//app.listen(process.env.PORT, function () {
//    console.log('Example app listening on port ' + process.env.PORT + '!');
//});
//// file: child.js
//var express = require('express'),
//    child = express.Router();
//console.log('child');
//child.get('/child', function (req, res) {
//    res.send('Child2');
//});
//child.get('/', function (req, res) {
//    res.send('Child');
//});

//module.exports = child;