const fs = require('fs');

const dirDB = 'db';
if (!fs.existsSync(dirDB)) {
    fs.mkdirSync(dirDB);
}

/* const dataType={
  integer:'INTEGER',
  text: 'TEXT'
  }; */


var AppDAO = require('./lib/sqlite-dao');
var dataType = require('./lib/sqlite-datatype');

var db = new AppDAO('./' + dirDB + '/db-sqlite3.db');


var createTable ={
    name: 'LOGIN',
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
            option_key: '',
            description: 'Ten user'
        }
    ]
};

db.createTable(createTable).then(data=>console.log(data));


var insertTable={ name:'LOGIN',
              cols:[{
                       name:'USER_NAME',
                       value:'cuongdq'
                    }]
              };


db.insert(insertTable).then(data=>console.log(data));


var updateTable={ name:'LOGIN',
                  cols:[{
                       name:'USER_NAME',
                       value:'def'
                    }],
                  wheres:[{
                      name:'ID',
                      value:1
                  }]
                };

db.update(updateTable).then(data=>console.log(data));


var deleteTable={ name:'LOGIN',
                  wheres:[{
                      name:'USER_NAME',
                      value:'1'
                  }]
                };

db.delete(deleteTable).then(data=>console.log(data));


db.getRsts('select * from LOGIN')
    .then(rows=>console.log(rows));


db.getRst('select * from LOGIN')
    .then(row=>console.log(row));


