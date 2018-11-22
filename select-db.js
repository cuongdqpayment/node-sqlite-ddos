const db = require('./db-service');
db.getRsts('select * from LOG_ACCESS_DETAILS')
    .then(rows=>console.log(rows));