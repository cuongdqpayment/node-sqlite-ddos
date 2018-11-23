const fs = require('fs');
const http = require('http');
const https = require('https');
const privateKey  = fs.readFileSync('cert/midle_key.pem', 'utf8');
const certificate = fs.readFileSync('cert/my-certificate_2.pem', 'utf8');

const credentials = {key: privateKey, cert: certificate};
const express = require('express');
const app = express();


app.get('/', function (req, res) {
    res.header('Content-type', 'text/html');
    return res.end('<h1>Hello, Secure World!</h1>');
});




// your express configuration here
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

const portHttp = process.env.PORT || 8080;
const portHttps = process.env.PORT || 8443;
// For http
httpServer.listen(portHttp,()=>{
    console.log("Server https with port: " + portHttp);
});
// For https
httpsServer.listen(portHttps,()=>{
    console.log("Server https with port: " + portHttps);
});

