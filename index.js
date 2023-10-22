//const express = require('express')

//const app = express()
//const PORT = 4000

//app.listen(PORT, () => {
//  console.log(`API listening on PORT ${PORT} `)
//})

//app.get('/', (req, res) => {
//  res.send('Hey this is my API running 🥳 do cho chet')
//})

//app.get('/about', (req, res) => {
//  res.send('This is my about route..... ')
//})

//// Export the Express API
//module.exports = app

const PORT = 4000;
const http = require("http");

const server = http.createServer((request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write("Hello World!");
    response.end();
});

server.listen(PORT, () => {
    console.log(`API listening on PORT ${PORT} `);
});
