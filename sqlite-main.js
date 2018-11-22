const fs = require('fs');

const dirDB = 'db';
if (!fs.existsSync(dirDB)) {
    fs.mkdirSync(dirDB);
}


var AppDAO = require('./sqlite-dynamic');

var db = new AppDAO('./dirDB/db-sqlite3.db');
