const db = require('./db-service');
db.getRsts('select rowid, a.* from LOG_ACCESS a')
    .then(rows=>console.log(rows));