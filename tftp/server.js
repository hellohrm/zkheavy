/*
  Simple TFTP server only working in binary mode
*/
var dgram = require('dgram');
var util = require('util');
var os = require('os');
var messageParser = require('./message_parser').messageParser;
var Session = require('./session.js').Session;

function Server(port) {

    const self = this,
        ZKDAT = {},//chua thong tin dem ve
        sessions = {},
        handleMsg = function (buffer, peer) {
            const msg = messageParser.parse(buffer),
                session = getOrCreateSession(peer, msg.file);

            session.handleMessage(msg);
            //
        }
        ,
        getOrCreateSession = function (peer) {

            var id = util.format("%s:%d", peer.address, peer.port);

            if (sessions[id] === undefined) {

                sessions[id] = new Session(id, self.socket, peer);
                sessions[id].broastcast = function (fi,dat) {
                    ZKDAT[fi] = dat;
                    deleteSession(sessions[id]);
                }

            }

            return sessions[id];

        }
        ,
        deleteSession = function (session) {
            session.destroy();
            delete sessions[session.id];
        };
    //
    //
    this.port = port || 6969;
    this.clearingIntervalId = undefined;
    //
    this.clearStaleSessions = function () {
        var clearTime = os.uptime() - 30;
        for (var sessionId in sessions) {
            if (sessions.hasOwnProperty(sessionId)) {
                if (sessions[sessionId].lastMsgAt < clearTime) {
                    console.log("Clearing stale session: %s", sessionId);
                    deleteSession(sessions[sessionId]);
                }
            }
        }
    };


    this.clearAllSessions = function () {
        for (var sessionId in sessions) {
            if (sessions.hasOwnProperty(sessionId)) {
                console.log("Clearing session: %s", sessionId);
                deleteSession(sessions[sessionId]);
            }
        }
    };

    this.socket = dgram.createSocket("udp4", handleMsg);

    this.RE = function (id) {
        //for (var sessionId in sessions) {
        //    if (sessions.hasOwnProperty(sessionId)) {
        //        //console.log("Clearing session: %s", sessionId);
        //        //deleteSession(sessions[sessionId]);
        //        if (sessions[sessionId].zkDAT == id) {
        //            const val = sessions[sessionId].buffer;
        //            deleteSession(sessions[sessionId]);
        //            return val;
        //        }
        //    }
        //};
        const val = ZKDAT[id] || [];
        delete ZKDAT[id];
        return val;
    }
}

Server.prototype.listen = function (callback) {

    this.socket.bind(this.port, "0.0.0.0", callback);

    //this.clearingIntervalId = setInterval(this.clearStaleSessions, 30000);
};

Server.prototype.address = function () {
    return this.socket.address();
};

Server.prototype.stop = function () {
    this.socket.close();
    clearInterval(this.clearingIntervalId);
    this.clearAllSessions();
};

exports.Server = Server;
