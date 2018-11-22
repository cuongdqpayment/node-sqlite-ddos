"use strict"

const sqlite3 = require('sqlite3').verbose();
const Promise = require('bluebird');


/* var dataType = {};

dataType.integer = 'INTEGER';
dataType.text = 'TEXT';

module.exports = dataType;
 */

class AppDAO {
  constructor(dbFilePath) {
    this.db = new sqlite3.Database(dbFilePath, (err) => {
      if (err) {
        console.error('Could not connect to database', err);
      } else {
        console.log('Connected to database ' + dbFilePath);
      }
    })
  }

  /**
   * 
   * @param {*} table 
   * var table ={
   *              name: 'LOGIN',
   *              cols: [
   *                      {
   *                        name: 'ID',
   *                        type: dataType.integer,
   *                        option_key: 'PRIMARY KEY AUTOINCREMENT',
   *                        description: 'Key duy nhat quan ly'
   *                        }
   *                      ]
   *            }
   */
  createTable(table) {
    let sql = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (';
    let i = 0;
    for (var col of table.cols) {
      if (i++ == 0) {
        sql += col.name + ' ' + col.type + ' ' + col.option_key;
      } else {
        sql += ', ' + col.name + ' ' + col.type + ' ' + col.option_key;
      }
    }
    sql += ')';
    return this.runSql(sql);
  }


  //insert
  /**
   * 
   * @param {*} insertTable 
   * var insertTable={
   *                  name:'tablename',
   *                  cols:[{
   *                        name:'ID',
   *                        value:'1'
   *                        }]
   *                  }
   * 
   */
  insert(insertTable) {
    let sql = 'INSERT INTO ' + insertTable.name
      + ' ('
    let i = 0;
    for (let col of insertTable.cols) {
      if (i++ == 0) {
        sql += col.name;
      } else {
        sql += ', ' + col.name;
      }
    }
    sql += ') VALUES (';

    i = 0;
    for (let col of insertTable.cols) {
      if (i++ == 0) {
        sql += '?';
      } else {
        sql += ', ?';
      }
    }
    sql += ')';
    let params = [];
    for (let col of insertTable.cols) {
      params.push(col.value);
    }
    return this.runSql(sql, params);
  }

  //update 
  /**
   * 
   * @param {*} updateTable
   *  var updateTable={
   *                  name:'tablename',
   *                  cols:[{
   *                        name:'ID',
   *                        value:'1'
   *                        }]
   *                  wheres:[{
   *                         name:'ID',
   *                         value:'1'
   *                         }]
   *                  }
   */
  update(updateTable) {
    let sql = 'UPDATE ' + updateTable.name + ' SET ';
    let i = 0;
    for (let col of updateTable.cols) {
      if (i++ == 0) {
        sql += col.name + '= ?';
      } else {
        sql += ', ' + col.name + '= ?';
      }
    }

    i = 0;
    for (let col of updateTable.wheres) {
      if (i++ == 0) {
        sql += ' WHERE ' + col.name + '= ?';
      } else {
        sql += ' AND ' + col.name + '= ?';
      }
    }
    let params = [];
    for (let col of updateTable.cols) {
      params.push(col.value);
    }
    for (let col of updateTable.wheres) {
      params.push(col.value);
    }
    return this.runSql(sql, params)
  }

  //delete
  /**
   * Ham xoa bang ghi
   * @param {*} id 
   */
  delete(deleteTable) {
    let sql = 'DELETE FROM ' + deleteTable.name;
    let i = 0;
    for (let col of deleteTable.wheres) {
      if (i++ == 0) {
        sql += ' WHERE ' + col.name + '= ?';
      } else {
        sql += ' AND ' + col.name + '= ?';
      }
    }
    let params = [];
    for (let col of deleteTable.wheres) {
      params.push(col.value);
    }
    return this.runSql(sql, params)
  }

  //lay 1 bang ghi dau tien cua select
  /**
   * lay 1 bang ghi
   * @param {*} sql 
   * @param {*} params 
   */
  getRst(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          // console.log('Error running sql: ' + sql)
          // console.log(err)
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  }

  /**
   * Lay tat ca cac bang ghi
   * @param {*} sql 
   * @param {*} params 
   */
  getRsts(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  //cac ham va thu tuc duoc viet duoi nay
  /**
   * Ham thuc thi lenh sql va cac tham so
   * @param {*} sql 
   * @param {*} params 
   */
  runSql(sql, params = []) {  //Hàm do ta tự đặt tên gồm 2 tham số truyền vào.
    return new Promise((resolve, reject) => {   //Tạo mới một Promise thực thi câu lệnh sql
      this.db.run(sql, params, function (err) {   //this.db sẽ là biến đã kết nối csdl, ta gọi hàm run của this.db chính là gọi hàm run của sqlite3 trong NodeJS hỗ trợ (1 trong 3 hàm như đã nói ở trên)
        if (err) {   //Trường hợp lỗi
          console.log('Could NOT excute: ' + sql)
          reject(err)
        } else {   //Trường hợp chạy query thành công
          resolve('Executed: ' + sql)   //Trả về kết quả là một object có id lấy từ DB.
        }
      })
    })
  }

}

module.exports = AppDAO; 