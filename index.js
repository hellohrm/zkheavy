//const PORT = 4000;
//const http = require("http"),
//    https = require('https');

const express = require('express');

const app = express();
const PORT = 4000;


const http = require("http"), https = require('https'), ftp = require('ftp'),
    dume = require('./mod/zkdog');
const { debug } = require('console');


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
    //
    (async (qry) => {

        try {

            const buf = await dume.FTP(ftp,qry);

            res.statusCode = 200;
            //
            res.end(buf, "binary");

        } catch (e) {

        };

        res.end();

    })(req.query);//('http://zkteco.royalwebhosting.net/zk/f/furi_9148796');

})

app.get('/zk/furi.php', (req, res) => {

   // console.log('dume');

    //const request = require('request');
    //request('http://zkteco.royalwebhosting.net/zk/f/furi_9148796').pipe(res);

    //res.send('Hey this is my API running 🥳 do cho chet')

    (async (url) => {
        try {

            const buf = await dume.httpGet(url, http, https);
            //res.writeHead(200, { 'content-type': "text/html" });
            //res.end(buf);
            //
            //res.statusCode = "200";
            //res.setHeader("Content-Type", "text/html");
            res.setHeader('Content-Length', buf.length);
            res.write(buf, 'binary');

        } catch (e) {

        };

        res.end();

    })(req.query['g'] + '://' + req.query['h'] + '/zk/fii.php?f=' + req.query['f']);//('http://zkteco.royalwebhosting.net/zk/f/furi_9148796');

})

app.get('/about', (req, res) => {
    res.send('This is my about route..... ')
})

// Export the Express API
module.exports = app




//const doP =process.env.PORT || 2121, 
//    FTP_UA = "123456789",
//    sessionU = function (U, P, mod, evtEND) {
//    let idx = -1,
//        u = cnf.user.find(function (o, i) {
//            idx = i;
//            return o.username === U;
//        });

//    if (mod == 1) {//add
//        if (!u) cnf.user.push({ username: U, password: P, evtEND: evtEND });
//    } else {//remove
//        if (u) {
//            if (evtEND == 2 || u.evtEND == 2) {// neu evtEND=force, u.evtEND ini session will remove
//                //2: rmv lap tuc
//                cnf.user.splice(idx, 1);
//                console.log('+++ sessionU remove dynamic U,P: ' + U);
//            }
//        };
//    };
//    return u;
//}
//    , cnf = {

//        port: doP,

//        basefolder: __dirname,
//        dynU: sessionU,
//        user: [{ username: FTP_UA, password: FTP_UA }, { username: 'autoupdate', password: '123456789' }],


//        endEVT: function (fle, un, postrigger) {
//            //var pth = fle.split("\\").slice(0, -1).join("\\");
//            //console.log("UN: " + un + " tmpfolder: " + pth);
//            //
//            if (un == 'autoupdate') {
//                if (fle.indexOf("global.json") > 0) {
//                    //fs.readFile('./global.json', 'utf8', function (err, data) {
//                    //    if (err) {
//                    //        return console.log(err);
//                    //    }
//                    //    let jGLO = JSON.parse(data);
//                    //    if (SHARED.VER != jGLO.ver) {
//                    //        console.log("Old Version:" + SHARED.VER + " ;New ver:" + jGLO.ver);
//                    //        //
//                    //        //iclock.WDMS_SVR co the la 192.168.1.91
//                    //        //luc nao cung phai update con 91 trong global file, 
//                    //        //=> khi update, cac may cham cong se ngat ket noi 
//                    //        //=> khi ket noi lai se switch ve local 91
//                    //        let tm = jGLO.u91, rst = [];
//                    //        //
//                    //        for (const key in tm) {
//                    //            if (!rst.includes(tm[key][0])) { rst.push(tm[key][0]); }
//                    //        }

//                    //        //https://thekenyandev.com/blog/how-to-restart-a-node-js-app-programmatically/
//                    //        if (!debugWIN) SHARED.REBOOT(['dabuocdenduongcung', rst.join(';')], 1);
//                    //    };
//                    //});
//                }
//            } else if (un != FTP_UA) {
//                //
//                let pth = path.dirname(fle),
//                    _U = sessionU(un, un, 0, 0);
//                //
//                //if (_U.evtEND == 2) {//dynamic nay se remove tempfolder
//                //    if (debugWIN) {
//                //        console.log('FOLDER [' + folder + '] DOWLOAD WINDOW DEBUG!');
//                //    } else {
//                //        //console.log('FOLDER [' + pth + '] DOWLOAD WINDOW DEBUG!');
//                //        RMV_TMPFO(pth);
//                //    }
//                //} else {
//                //    console.log('endEVT ignore remove [' + pth + '] !');
//                //}
//            }
//        }

//        //username: FTP_UA,
//        //password: FTP_UA,
//        //allowAnonymousLogin: true,
//        //allowLoginWithoutPassword:true
//    }
//    , { ftpd } = require('./mod/jsftpd');//https://github.com/mailsvb/jsftpd

//new ftpd({
//    cnf: cnf,
//    hdl: {
//        upload: function (username, relativePath, fileName, data, retrOffset) {
//            //debugger;
//            console.log('du me');
//            return true;
//        }
//    }

//}).start();

//console.log(`FTP listening on PORT ${doP} `);