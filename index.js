
const express = require('express');

const app = express();
const PORT = 4000;


const http = require("http"),
    https = require('https');

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

app.get('/', (req, res) => {

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
        res.end(buf, "binary");

        //res.end(new Buffer(buf,'binary'));

        //// Prints Output on the browser in response 
        //res.end(' ok'); 


    })('http://zkteco.royalwebhosting.net/zk/f/furi_9148796');

})

app.get('/about', (req, res) => {
    res.send('This is my about route..... ')
})

// Export the Express API
module.exports = app

