const express = require('express'), server = express();
const fs = require('fs');
const url = require('url');
const formidable = require('formidable');
const systempath = require('path');
const os = require('os');
const mime = require('mime-types');
const request = require('request');
const HTMLParser = require('node-html-parser');
const cheerio = require('cheerio');
//const screenShotHtml = require("node-server-screenshot");
const DDDoS = require('dddos');

const db = require('./db-service');


//duong dan temp cua he thong truong hop khong co quyen truy cap thu muc
const tempdir = os.tmpdir();
//tao duong dan luu tru file upload post
const dirUpload = 'upload_files';
if (!fs.existsSync(dirUpload)) {
    fs.mkdirSync(dirUpload);
}

//tao duong dan luu tru file anh chup man hinh
const dirScreenShot = 'screen_shot_images';
if (!fs.existsSync(dirScreenShot)) {
    fs.mkdirSync(dirScreenShot);
}


//khai bao cac bien toan cuc de truy van
var reqUrlString;
var reqOriginalPath;
var method;
var pathName;
var reqFullHost;

//--------------------------------------------
//kiem tra ngo vao phong chong tan cong
//neu cung 1 dia chi vao nhieu thi tu choi ngay
server.use(function (req, res, next) {
    //lay cac thong tin request ban dau de luu vao csdl

    //doan lay thong tin cac bien su dung sau nay
    reqUrlString = req.url;
    reqOriginalPath = req.originalUrl;
    method = req.method;
    pathName = decodeURIComponent(url.parse(reqUrlString, true, false).pathname);
    reqFullHost = req.protocol + '://' + req.get('host');
    //encodeURIComponent('אובמה') // %D7%90%D7%95%D7%91%D7%9E%D7%94 
    //decodeURIComponent('%D7%90%D7%95%D7%91%D7%9E%D7%94') // אובמה
    //console.log('from:' + req.ip + '\n' + method +" " + reqFullHost + '/' + pathName);
    
    //----- LUU LOG FILE BEFORE-----
    var log = {
        name: 'LOG_ACCESS',
        cols: [{
            name: 'IP',
            value: req.ip
        },
        {
            name: 'ACCESS_INFO',
            value: method + " " + reqFullHost + '/' + pathName
        },
        {
            name: 'DEVICE_INFO',
            value: req.headers["user-agent"]
        }
        ],
        wheres: [{
            name: 'IP',
            value: req.ip
        }]
    };
    db.insert(log)
      .then(data => {
          //console.log(data)
        }
      )
      .catch(err=>{
          db.runSql("update LOG_ACCESS set LOG_COUNT=LOG_COUNT+1 where IP='"+req.ip+"'")
          .then(data=>{
              //console.log(data)
          })
      });
    //-----------------------------------------
    //tra den phien tiep theo
    next();
});



//CHONG TAN CONG DDDOS
//ngan chan truy cap ddos tra ket qua cho user neu truy cap tan suat lon
let ddos = new DDDoS({
    errorData: "Hãy bình tĩnh, đợi tý đi!",
    //Data to be passes to the client on DDoS detection. Default: "Not so fast!".
    errorCode: 429,
    //HTTP error code to be set on DDoS detection. Default: 429 (Too Many Requests)
    weight: 1,
    maxWeight: 10,
    checkInterval: 1000,
    rules: [
        { //cho phep trang chu truy cap 16 yeu cau / 1 giay
            string: '/',
            maxWeight: 30
        },
        { // Allow 4 requests accessing the application API per checkInterval 
            regexp: "^/api.*",
            flags: "i",
            maxWeight: 4,
            queueSize: 4 // If request limit is exceeded, new requests are added to the queue 
        },
        { // Chi cho phep 1 request trong 1 giay thoi, neu qua se bao not so fast 
            string: "/test-upload",
            maxWeight: 1
        },
        { // Allow up to 16 other requests per check interval.
            regexp: ".*",
            maxWeight: 16
        }
    ]
});

server.use(ddos.express('ip', 'path'));

/**
 * CAC CONTENT_TYPE TRA VE CLIENT LUU Y NHU SAU:
 * 1. TRA JSON KET QUA DUNG: DEFAULT LA UTF-8
 * res.writeHead(200, { 'Content-Type': 'application/json'});
 * 2. TRA JSON KET QUA SAI:
 * res.writeHead(404, { 'Content-Type': 'application/json'});
 * 3. TRA VE WEB HTML: Dung la 200/sai la 404
 * res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8' });
 * 4. TRA VE FILE UNG DUNG: Dung la 200
 * res.writeHead(200, {'Content-Type': mime.lookup(filename) });
 * 
 */
server.use((req, res, next) => {

    //----- LUU LOG FILE TRUY CAP CHUC NANG-----
    var log = {
        name: 'LOG_ACCESS_DETAILS',
        cols: [{
            name: 'IP',
            value: req.ip
        },
        {
            name: 'ACCESS_INFO',
            value: method + " " + reqFullHost + '/' + pathName
        },
        {
            name: 'DEVICE_INFO',
            value: req.headers["user-agent"]
        }
        ],
        wheres: [{
            name: 'IP',
            value: req.ip
        }]
    };
    db.insert(log)
      .then(data => {
          console.log(data)
        }
      )
      .catch(err=>{
          db.runSql("update LOG_ACCESS_DETAILS set LOG_COUNT=LOG_COUNT+1 "
                    +", DEVICE_INFO='"+req.headers["user-agent"]+"'"
                    +" where IP='"+req.ip+"'"
                    +" and ACCESS_INFO='"+method + " " + reqFullHost + '/' + pathName+"'")
          .then(data=>{
              console.log(data)
          })
      });
    //-----------------------------------------
    
    res.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    //res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    //res.header('Access-Control-Allow-Origin', 'http://localhost:8100');
    //muon cho phep truy cap tu server nao thi reply cac website tuong ung
    res.header("Access-Control-Allow-Origin", "*"); //khai bao chap nhan tat ca de test
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    //tra den phien tiep theo
    next();
});

//-----------------------------------------
//1.dang ky duong dan tuyet doi co dinh cho ionic
server.use(express.static(__dirname + '/www'));
//server.use(express.static('www'));

//2.post bat ky formdata len de test, tra ket qua
//khong ghi lai bat ky thu gi ca
server.post('/any-form', (req, res, next) => {
    const form = new formidable.IncomingForm();

    var jsonReturn = {
        command_id: method,
        status: "ok",
        message: "file uploaded!",
        method: method,
        your_req_host: reqFullHost,
        your_req_ip: req.ip,
        your_req_path: pathName,
        your_command: method + " " + reqFullHost + '/' + pathName,
        your_params: [],
        your_files: [],
        your_error: []
    };

    //Tra ket qua ve duoi dang json cho nguoi dung
    form.parse(req, function (err, fields, files) {

        if (err) {
            jsonReturn.your_error.push(err);
        } else {
            for (let key in fields) {
                //kiem tra tinh hop le cua cac truong tham so

                //tra ket qua cho user
                jsonReturn.your_params.push({
                    name: key,
                    value: fields[key]
                });
            }

            for (let key in files) {
                //kiem tra tinh hop le cua file roi moi luu vao 

                //tra ket qua cho user biet
                jsonReturn.your_files.push({
                    name: key,
                    path: files[key].path,
                    file_name: files[key].name,
                    content_type: files[key].type,
                    file_sise: files[key].size
                });
            }
        }

        //gui trang thai bao noi dung tra ve
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(jsonReturn));
    });
});

//3.thuc hien post duong dan /file_upload
server.post('/file-upload', (req, res, next) => {
    const form = new formidable.IncomingForm();
    var jsonReturn = {
        command_id: method,
        status: "ok",
        message: "file uploaded!",
        method: method,
        your_req_host: reqFullHost,
        your_req_ip: req.ip,
        your_req_path: pathName,
        your_command: method + " " + reqFullHost + '/' + pathName,
        your_params: [],
        your_files: [],
        your_error: []
    };


    //Tra ket qua ve duoi dang json cho nguoi dung
    form.parse(req, function (err, fields, files) {

        if (err) {
            jsonReturn.your_error.push(err);
        } else {
            for (let key in fields) {
                //kiem tra tinh hop le cua cac truong tham so
                //cac chuoi bao mat nam o day de kiem tra dam bao khong phai bi fake thong tin

                //tra ket qua cho user
                jsonReturn.your_params.push({
                    name: key,
                    value: fields[key]
                });
            }

            for (let key in files) {
                //kiem tra tinh hop le cua file roi moi luu vao 
                if (key.indexOf('file2Upload') >= 0) {
                    let curdatetime = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/-/g, '').replace(/:/g, '');
                    var filenameStored = curdatetime + "_"
                        + files[key].size + "_"
                        + files[key].name;

                    fs.createReadStream(files[key].path)
                        .pipe(fs.createWriteStream(dirUpload + systempath.sep + filenameStored))
                        ;

                    //tra ket qua cho user biet
                    jsonReturn.your_files.push({
                        name: key,
                        path: files[key].path,
                        file_name: files[key].name,
                        content_type: files[key].type,
                        file_sise: files[key].size,
                        url_img: reqFullHost + '/file-upload/fix/' + filenameStored
                    });

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                } else {
                    //khong phai tham so cua minh thi bo qua khong luu
                    //thuc hien xoa hoac ghi log bao cao admin
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                }
            }
        }
        //
        //gui trang thai bao noi dung tra ve
        res.end(JSON.stringify(jsonReturn));
    });

});


//4. Post duong dan ben ngoai dang bat ky
//du lieu post la mot chuoi text/json chu khong phai formdata
server.post('/json-data', (req, res, next) => {
    var jsonReturn = {
        command_id: method,
        status: "ok",
        message: "file uploaded!",
        method: method,
        your_req_host: reqFullHost,
        your_req_ip: req.ip,
        your_req_path: pathName,
        your_command: method + " " + reqFullHost + '/' + pathName,
        your_params: [],
        your_files: [],
        your_error: []
    };

    var postDataString = '';
    // Get all post data when receive data event.
    req.on('data', (chunk) => {
        postDataString += chunk;
    });

    // When all request post data has been received.
    req.on('end', () => {
        //chuyen doi Object JSON tu chuoi data nhan duoc
        var postDataObject = JSON.parse(postData);

        //truong hop chuoi string nhan duoc khong phai la JSON????

        //quy uoc cac tham so cua doi tuong JSON hop le thi moi su dung xu ly
        if (postDataObject.command_id) {
            //quy uoc moi lenh post len phai co comand_id
            //tuy vao cac command_id ma chung ta xu ly tra ket qua hop le
            //'Content-Type': 'application/json': The default encoding is UTF-8. 
            res.writeHead(200, { 'Content-Type': 'application/json' });
            jsonReturn.your_params.push(postDataObject.command_id);
        } else {
            //day la cac chuoi post khong mong doi tu client
            //co the la cac hacker thuc hien 
            res.writeHead(404, { 'Content-Type': 'application/json' });
            jsonReturn.your_error.push({ message: 'YOU ARE SO STUPID!' });
        }
        res.end(JSON.stringify(jsonReturn));
    });
});


//5. mo trang web don gian de test thu server hoat dong
server.get('/test-upload', (req, res, next) => {
    //
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<form action="' + reqFullHost + '/file-upload" method="post" enctype="multipart/form-data">');
    res.write('<input type="text" name="user" value="cuongdq"><br>');
    res.write('<input type="file" name="file2Upload" multiple><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
});

//6. GET /file-upload/<tmp/fix>/<tenfile>
server.get('/file-upload/*', (req, res, next) => {
    let isTmp = pathName.substring(13, 16) === 'tmp';
    let isScr = pathName.substring(13, 16) === 'scr';
    let imgDir = isTmp ? tempdir : isScr ? dirScreenShot : dirUpload;

    //console.log(pathName.substring(13,16));
    var fileRead = imgDir + systempath.sep + pathName.substring(17);
    var contentType = 'image/jpeg';
    if (mime.lookup(pathName)) contentType = mime.lookup(pathName);
    fs.readFile(fileRead, { flag: 'r' }, function (error, data) {
        if (!error) {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(JSON.stringify(error));
        }
    });

});

//7. get file api from api_sample
server.get('/api-samples/*', (req, res, next) => {
    // 
    const fileName = "api_samples" + systempath.sep + pathName.substr(13);

    fs.readFile(fileName, { encoding: 'utf-8', flag: 'r' }, function (error, data) {
        if (!error) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(error));
        }
    });
});

//8. lay chuoi request thuc su link
server.get('/url-request/*', (req, res, next) => {
    const urlRequest = pathName.substr(13);
    request(urlRequest, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body) // Print the google web page.
            //doc body lay mot anh dai dien?? icon?? 
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(body);
        } else {
            //console.log(error);
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(error));
        }
    });
});


//9. lay chuoi request thuc su link
server.get('/url-request-image/*', (req, res, next) => {
    //lay chuoi request thuc su link
    const urlRequest = pathName.substr(19);

    let curdatetime = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/-/g, '').replace(/:/g, '');
    const screenShotFilename = curdatetime + "_" + "screenshot_"
        + decodeURIComponent(urlRequest).replace(/\//g, '_').replace(/:/g, '')
        + ".png";
    //chup 1 anh cua duong dan luu vao screen_shot_images
    /* screenShotHtml.fromURL(urlRequest, dirScreenShot
        + systempath.sep
        + screenShotFilename,{width:327,height:245}, (err) => { }); */
    //--------------  

    request(urlRequest, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body) // Print the google web page.
            //doc body lay mot anh dai dien?? icon?? 
            res.writeHead(200, { 'Content-Type': 'application/json' });
            //loc lay anh dai dien dau tien va tra ve json anh
            const root = HTMLParser.parse(body);
            const imgHtml = (root.querySelector('img') ? root.querySelector('img').toString() : '<img src="">');
            const $ = cheerio.load(imgHtml);
            const url_img = $('img').attr('src');
            const title = (root.querySelector('title') ? root.querySelector('title').text : '');
            const h1 = (root.querySelector('h1') ? root.querySelector('h1').text : '');
            const h2 = (root.querySelector('h2') ? root.querySelector('h2').text : '');

            res.end(JSON.stringify(
                {
                    image: (url_img.indexOf("://") > 0 ? url_img : urlRequest + "/" + url_img),
                    image_inter: url_img,
                    protocol: url_img.substring(0, url_img.indexOf("://")),
                    host: urlRequest,
                    path: pathName,
                    title: title,
                    h1: h1,
                    h2: h2,
                    screen_shot: reqFullHost + '/file-upload/src/' + screenShotFilename
                }
            ));
        } else {
            //console.log(error);
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(error));
        }
    });
});


//10. list toan bo cac file upload len sys.tmp kieu anh thoi
server.get('/uploaded-images/*', (req, res, next) => {
    // list toan bo cac file upload len sys.tmp kieu anh thoi
    let isTmp = pathName.substring(17) == 'tmp';
    let isScr = pathName.substring(17) == 'scr';
    let imgDir = isTmp ? tempdir : isScr ? dirScreenShot : dirUpload;
    let imgLink = isTmp ? 'tmp' : isScr ? 'scr' : 'fix';

    var list_images = [];
    var responseJson = { "results": "[]", "status": "OK", "message": "List image uploaded OK!" };

    fs.readdir(imgDir + systempath.sep, (err, files) => {
        if (!err && files) {
            let i = 0;
            files.forEach(file => {
                //console.log(file);
                //console.log(mime.lookup(file));
                if (mime.lookup(file)
                    &&
                    mime.lookup(file).indexOf('image/') >= 0) {
                    list_images.push({
                        "id": ++i,
                        "content_type": mime.lookup(file),
                        "src_url": reqFullHost
                            + "/file_upload/"
                            + imgLink + "/"
                            + file
                    });
                }
            })
        } else {
            //loi doc thu muc
            responseJson = { "status": "NOK", "message": '"' + err + '"' };
        }

        //tra ket qua ve cho client neu khong thi no doi miet
        if (list_images.length > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            //res.end("Server had " + list_image.length);
            responseJson["results"] = list_images;
            res.end(JSON.stringify(responseJson));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(responseJson));
        }

    });
});



//11. list toan bo cac file upload len sys.tmp kieu anh thoi
server.get('/test-list-images/*', (req, res, next) => {
    // list toan bo cac file upload len sys.tmp kieu anh thoi
    let isTmp = pathName.substring(18) == 'tmp';
    let isScr = pathName.substring(18) == 'scr';
    let imgDir = isTmp ? tempdir : isScr ? dirScreenShot : dirUpload;
    let imgLink = isTmp ? 'tmp' : isScr ? 'scr' : 'fix';

    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.readdir(imgDir + systempath.sep, (err, files) => {
        if (!err && files) {
            let i = 0;
            files.forEach(file => {
                if (mime.lookup(file)
                    &&
                    mime.lookup(file).indexOf('image/') >= 0) {
                    res.write("<p>" + "<img title='" + file + "' " + "alt='" + (++i) + "' " +
                        " src='" + reqFullHost + "/file-upload/"
                        + imgLink + "/"
                        + file + "' "
                        + " width='300' height='200' />" + "</p>");
                }
            })
        } else {
            res.write("<p>" + JSON.stringify(err) + "</p>");
        }
        return res.end();
    });
});

//12. mo dia chi trang web da duoc ma hoa luu tru chuyen doi ngan gon
//xem dich vu bit.ly
server.get('/bit.ly/*', (req, res, next) => {
    //doc chuoi ma hoa phia sau
    const shortCode = pathName.substring(8);
    //chuyen doi chuoi ma hoa da duoc ma hoa trong db
    //lay duong dan http thuc su cua trang web
    //chuyen tra ve dinh tuyen
    var url = 'https://css-tricks.com/redirect-web-page/';
    if (shortCode == '1') {
        url = 'http://dantri.com.vn';
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<meta http-equiv="refresh" content="0; URL=\'' + url + '\'" />');
    return res.end();
});

//The 404 Route (ALWAYS Keep this as the last route)
server.all('*', function (req, res) {
    //gui trang thai bao noi dung tra ve
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Đừng tìm kiếm vô ích. Đố mầy hack đấy!</h1>Are You Lazy???');
});

server.set('port', process.env.PORT || 9235);

server.listen(server.get('port'), function () {
    console.log("Server (" + os.platform() + "; " + os.arch() + ") is started with PORT: "
        + server.get('port')
        + "\n tempdir: " + os.tmpdir()
        + "\n " + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    );
});