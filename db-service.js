const fs = require('fs');
//chen 2 doi tuong su dung cho sqlite - cuongdq
var AppDAO = require('./lib/sqlite-dao');
var dataType = require('./lib/sqlite-datatype');

const dirDB = 'db';
if (!fs.existsSync(dirDB)) {
    fs.mkdirSync(dirDB);
}
var db = new AppDAO('./' + dirDB + '/app-service.db');

var admin ={
    name: 'ADMIN',
    cols: [
        {
            name: 'ID',
            type: dataType.integer,
            option_key: 'PRIMARY KEY AUTOINCREMENT',
            description: 'Key duy nhat quan ly'
        },
        {
            name: 'USER_NAME',
            type: dataType.text,
            option_key: 'NOT NULL UNIQUE',
            description: 'Ten user la duy nhat'
        },
        {
            name: 'PASSWORD',
            type: dataType.text,
            option_key: '',
            description: 'Mat khau duoc ma hoa'
        },
        {
            name: 'FULL_NAME',
            type: dataType.text,
            option_key: '',
            description: 'Ho va ten'
        },
        {
            name: 'PHONE',
            type: dataType.text,
            option_key: '',
            description: 'So dien thoai'
        },
        {
            name: 'EMAIL',
            type: dataType.text,
            option_key: '',
            description: 'Dia chi email'
        }
    ]
};

db.createTable(admin).then(data=>console.log(data));

var logs ={
    name: 'LOG_ACCESS',
    cols: [
        {
            name: 'IP',
            type: dataType.text,
            option_key: 'NOT NULL UNIQUE',
            description: 'Key duy nhat quan ly'
        },
        {
            name: 'LOG_COUNT',
            type: dataType.integer,
            option_key: 'DEFAULT 1',
            description: 'So lan truy cap'
        },
        {
            name: 'LAST_ACCESS',
            type: dataType.text,
            option_key: '',
            description: 'Thoi gian truy cap gan nhat'
        },
        {
            name: 'ACCESS_INFO',
            type: dataType.text,
            option_key: '',
            description: 'Thong tin truy cap'
        },
        {
            name: 'DEVICE_INFO',
            type: dataType.text,
            option_key: '',
            description: 'Thong tin may'
        },
        {
            name: 'LOCATION',
            type: dataType.text,
            option_key: '',
            description: 'VI TRI'
        }
    ]
};

db.createTable(logs).then(data=>console.log(data));



var log_details ={
    name: 'LOG_ACCESS_DETAILS',
    cols: [
        {
            name: 'IP',
            type: dataType.text,
            option_key: 'NOT NULL',
            description: 'Key duy nhat quan ly'
        },
        {
            name: 'ACCESS_INFO',
            type: dataType.text,
            option_key: 'NOT NULL',
            description: 'Thong tin truy cap'
        },
        {
            name: 'LOG_COUNT',
            type: dataType.integer,
            option_key: 'DEFAULT 1',
            description: 'So lan truy cap'
        },
        {
            name: 'LAST_ACCESS',
            type: dataType.text,
            option_key: '',
            description: 'Thoi gian truy cap gan nhat'
        },
        {
            name: 'DEVICE_INFO',
            type: dataType.text,
            option_key: '',
            description: 'Thong tin may'
        },
        {
            name: 'LOCATION',
            type: dataType.text,
            option_key: ', unique(IP, ACCESS_INFO)',
            description: 'VI TRI, va cau lenh unique'
        }
    ]
};

db.createTable(log_details).then(data=>console.log(data));

module.exports = db;