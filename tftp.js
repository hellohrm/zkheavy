const dgram = require('dgram');
const fs = require('fs');
//const path = require('path');

const TFTP_PORT = 69;
//const DOCUMENTROOT = process.cwd();

/**
 * WRQ和DATA包由ACK或ERROR数据包确认，RRQ包由DATA或ERROR数据包确认
 * 
 * RRQ/WRQ包
 * | Opcode | Filename | 0 | Mode | 0 | 
 * Opcode: 1-5
 * Mode: netascii/octet/mail
 * 
 * DATA包
 * | Opcode | Block # | Data |
 * 
 * ACK包
 * | Opcode | Block # |
 * 
 * ERROR包
 * | Opcode | ErrorCode | ErrMsg | 0 |
 */
const RRQ = 1;
const WRQ = 2;
const DATA = 3;
const ACK = 4;
const ERROR = 5;

const DATASIZE = 512;

// 传输模式
const MASCII = 1;
const MOCTET = 2;
const MMAIL = 3;


// 错误代码
const ERROR_UNDEFINED = 0; //Not defined, see error message. （未定义的错误，需要查看错误信息）
const ERROR_NOTFOUND = 1; //File not found. （文件未找到，服务器未找到下载请求中指定的文件）
const ERROR_ACCESS = 2; //Access violation. （访问违规，程序对于服务器的默认路径没有写权限导致的）
const ERROR_DISKFULL = 3; //Disk full or allocation exceeded. （磁盘已满或超出分配，上传文件时可能会出现这个错误）
const ERROR_UNKNOW = 4; //Illegal TFTP operation. （非法的 TFTP 操作，服务器无法识别 TFTP 包中的操作码）
const ERROR_ID = 5; //Unknown transfer ID. （未知的传输标识）
const ERROR_FILEEXIST = 6; //File already exists. （文件已存在，要上传的文件已存在于服务器中）
const ERROR_USER = 7; //No such user. （没有该用户）


const gloDAT = {};// chunks = [];// A chunk of data has been recieved.




class Server {
    constructor(config) {
        this.config = config;
        config.port = this.port = config.port ? config.port : TFTP_PORT;

        //this.documentRoot = config.documentRoot ? config.documentRoot : DOCUMENTROOT;
        //try {
        //    fs.accessSync(this.documentRoot, fs.constants.F_OK);
        //} catch (err) {
        //    this.documentRoot = DOCUMENTROOT;
        //}
        //if (!this.documentRoot.match(/\\$/))
        //    this.documentRoot += path.sep;
        //config.documentRoot = this.documentRoot;

        this.server = dgram.createSocket('udp4');
        this.filename = ''; //文件名
        this.mode = ''; //传输模式1ascii/2bin/3mail
        this.dataPacketNo = 0; //数据包编号
        this.data = ''; //要发送的数据
        this.errorNo = ERROR_UNDEFINED; //错误号
        this.errorMsg = '';
        this.fd = null; //文件句柄

    }

    run() {
        const server = this.server;

        server.on('error', (err) => {
            console.log(`tftp服务出错：\n${err.stack}`);
            server.close();
        });
        server.on('message', (msg, rinfo) => {//console.log(msg.toString());console.log(msg);
            this.task(msg, rinfo); //todo: 启动子进程处理
        });
        server.on('listening', () => {
            const address = server.address();

            console.log(`{black.bgGreen tftp服务运行在${address.address}:${address.port}} `);

            console.log(`{black.bgGreen 目录${this.documentRoot}} `);


        });

        server.bind(this.config.port);

 
    }

    stop() {
        this.server.close();
        console.log(`服务关闭`);
    }

    /**
     * 
     * @param {Buffer} msg 
     * @param {object} rinfo 
     */
    task(msg, rinfo) {

        //Buffer支持的字符编码ascii utf8 utf16le(ucs2) base64 latin1(binary) hex
        const server = this.server;
        const opcode = msg.readUInt8(1);

        msg = msg.slice(2); //去掉opcode
        //数据包分段
        let msgStart = 0;
        let msgArr = [];
        for (let i = 0; i < msg.length; i++) {
            if (msg[i] === 0) {
                msgArr.push(msg.slice(msgStart, i));
                msgStart = i + 1;
            }
        }

        let filename, mode; //文件名、传输模式
        let packetNo; //数据包编号
        let buf; //要发送的buffer

        switch (opcode) {
            case RRQ:
                console.log('get');
                this.filename = filename = Buffer.from(msgArr[0]).toString('ascii'); //tftp的文件名只能是ascii字符
                mode = Buffer.from(msgArr[1]).toString('ascii');
                console.log(mode, filename);
                switch (mode) {
                    case 'netascii':
                        this.mode = MASCII;
                        try {
                            this.data = fs.readFileSync(this.documentRoot + filename);
                            this.dataPacketNo = 1;
                            buf = this.makePack(DATA);
                        } catch (err) {
                            this.errorNo = ERROR_NOTFOUND;
                            this.errorMsg = err.message;
                            buf = this.makePack(ERROR);
                            this.resetData();
                        }
                        break;
                    case 'octet':
                        this.mode = MOCTET;
                        try {
                            let readBuf = Buffer.alloc(DATASIZE);
                            if (this.fd === null)
                                this.fd = fs.openSync(this.documentRoot + filename);
                            let nbyte = fs.readSync(this.fd, readBuf, 0, DATASIZE);
                            if (nbyte < DATASIZE && this.fd) {
                                fs.closeSync(this.fd);
                                this.fd = null;
                            }
                            this.data = readBuf;
                            this.dataPacketNo = 1;
                            buf = this.makePack(DATA);
                        } catch (err) {
                            this.errorNo = ERROR_NOTFOUND;
                            this.errorMsg = err.message;
                            buf = this.makePack(ERROR);
                            this.resetData();
                        }
                        break;
                    case 'mail':
                        this.mode = MMAIL;
                        break;
                }
                break;
            case WRQ:

                console.log('put');

                this.filename = filename = Buffer.from(msgArr[0]).toString('ascii'); //tftp的文件名只能是ascii字符

                mode = Buffer.from(msgArr[1]).toString('ascii');

                console.log(mode, filename);

                if (!gloDAT[filename]) {//tao moi
                    gloDAT[filename] = new Array();// new chunk
                };

                switch (mode) {
                    case 'netascii':
                        this.mode = MASCII;
                        break;
                    case 'octet':
                        this.mode = MOCTET;
                        break;
                    case 'mail':
                        this.mode = MMAIL;
                        break;
                }
                buf = this.makePack(ACK);


                //if (fs.existsSync(this.documentRoot + filename)) {
                //    this.errorNo = ERROR_FILEEXIST;
                //    this.errorMsg = 'File already exists.';
                //    buf = this.makePack(ERROR);
                //    this.resetData();
                //} else {
                    
                //}
                break;
            case DATA:
                console.log('data');
                console.log(msg);
                packetNo = msg.readUInt16BE(0);
                this.dataPacketNo = packetNo;
                try {
                

                    this.filename = filename = Buffer.from(msgArr[0]).toString('ascii'); //tftp的文件名只能是ascii字符

                    msg = msg.slice(2); // 去掉前2个byte
                    //fs.appendFileSync(this.documentRoot + this.filename, msg);
                    //append to file cache
                    gloDAT[this.filename].push(msg);
                    //
                    //
                    buf = this.makePack(ACK);

                    if (msg.length < DATASIZE) {
                        this.resetData();
                        console.log(gloDAT[filename]);
                    }

                } catch (err) {
                    this.errorNo = ERROR_UNDEFINED;
                    this.errorMsg = err.message;
                    //
                    buf = this.makePack(ERROR);
                    this.resetData();
                }
                break;
            case ACK:
                console.log('ack');
                packetNo = msg.readUInt16BE(0);
                this.dataPacketNo = packetNo + 1;
                if (this.mode == MOCTET) {
                    let readBuf = Buffer.alloc(DATASIZE);
                    let nbyte = 0;
                    if (this.fd) {
                        nbyte = fs.readSync(this.fd, readBuf, 0, DATASIZE);
                        this.data = readBuf;
                    } else {
                        this.data = '';
                    }
                    if (nbyte < DATASIZE) { //结束传输
                        this.resetData();
                    }
                }
                buf = this.makePack(DATA);
                break;
            case ERROR:
                console.log(`客户端报错: ${String.fromCharCode(...msg.slice(2))}`);
                this.resetData();
                break;
        }
        if (buf !== undefined) {
            //console.log(buf)
            server.send(buf, rinfo.port, rinfo.address);
        }

    }

    makePack(opcode) {
        let cBuf, //opcode_buf
            nBuf, //block_number_buf
            eBuf, //error_buf
            dataBuf,
            buf;
        switch (opcode) {
            case RRQ:
                cBuf = new Uint8Array([0, DATA]);
                nBuf = new Uint8Array([0, this.dataPacketNo]);

                switch (this.mode) {
                    case MASCII:
                        dataBuf = Buffer.from(this.data);
                        if (dataBuf.length >= this.dataPacketNo * DATASIZE) {
                            dataBuf = dataBuf.slice((this.dataPacketNo - 1) * DATASIZE, this.dataPacketNo * DATASIZE)
                        } else {
                            dataBuf = dataBuf.slice((this.dataPacketNo - 1) * DATASIZE, dataBuf.length)
                        }
                        break;
                    case MOCTET:
                        dataBuf = this.data;
                        break;
                }

                buf = Buffer.concat([cBuf, nBuf, dataBuf]);
                break;
            case WRQ:
                break;
            case DATA:
                cBuf = new Uint8Array([0, DATA]);
                nBuf = new Uint16Array([this.dataPacketNo]);

                switch (this.mode) {
                    case MASCII:
                        dataBuf = Buffer.from(this.data);
                        if (dataBuf.length >= this.dataPacketNo * DATASIZE) {
                            dataBuf = dataBuf.slice((this.dataPacketNo - 1) * DATASIZE, this.dataPacketNo * DATASIZE);
                        } else {
                            dataBuf = dataBuf.slice((this.dataPacketNo - 1) * DATASIZE, dataBuf.length);
                        }
                        break;
                    case MOCTET:
                        dataBuf = this.data;
                        break;
                }

                if (!dataBuf) {
                    dataBuf = Buffer.alloc(0);
                }
                buf = Buffer.concat([cBuf, new Uint8Array(nBuf.buffer, 1, 1), new Uint8Array(nBuf.buffer, 0, 1), dataBuf]); //Uint16Array转Uint8Array注意大小端排序

                break;
            case ACK:
                cBuf = new Uint8Array([0, ACK]);
                nBuf = new Uint16Array([this.dataPacketNo]);
                buf = Buffer.concat([cBuf, new Uint8Array(nBuf.buffer, 1, 1), new Uint8Array(nBuf.buffer, 0, 1)]); //Uint16Array转Uint8Array注意大小端排序
                break;
            case ERROR:
                cBuf = new Uint8Array([0, ERROR]);
                eBuf = new Uint8Array([0, this.errorNo]);
                dataBuf = Buffer.from(this.errorMsg);
                buf = Buffer.concat([cBuf, eBuf, dataBuf]);
                break;
        }
        return buf;
    }

    resetData() {
        this.filename = '';
        this.mode = '';
        this.dataPacketNo = 0;
        this.data = '';
        this.errorNo = 0;
        this.errorMsg = '';
        if (this.fd) {
            fs.closeSync(this.fd);
            this.fd = null;
        }
    }
}

module.exports = Server