
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
