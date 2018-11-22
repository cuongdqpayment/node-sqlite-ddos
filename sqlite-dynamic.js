"use strict"

const sqlite3 = require('sqlite3').verbose();
const Promise = require('bluebird');

class AppDAO {  
    constructor(dbFilePath) {
      this.db = new sqlite3.Database(dbFilePath, (err) => {
        if (err) {
          console.log('Could not connect to database', err);
        } else {
          console.log('Connected to database ' + dbFilePath);
        }
      })
    }

    createTable() {  
        const sql = `
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT)`
        return this.db.runSql(sql)
    }

    //cac ham va thu tuc duoc viet duoi nay
    runSql(sql, params = []) {  //Hàm do ta tự đặt tên gồm 2 tham số truyền vào.
        return new Promise((resolve, reject) => {   //Tạo mới một Promise thực thi câu lệnh sql
          this.db.run(sql, params, function (err) {   //this.db sẽ là biến đã kết nối csdl, ta gọi hàm run của this.db chính là gọi hàm run của sqlite3 trong NodeJS hỗ trợ (1 trong 3 hàm như đã nói ở trên)
            if (err) {   //Trường hợp lỗi
              console.log('Error running sql ' + sql);
              console.log(err);
              reject(err)
            } else {   //Trường hợp chạy query thành công
              resolve({ result: 'Thuc hien xong!' })   //Trả về kết quả là một object có id lấy từ DB.
            }
          })
        })
    }


    //lay toan bo ket qua boi cau lenh select sql
    getRst(sql, params = []) {
        return new Promise((resolve, reject) => {
          this.db.get(sql, params, (err, result) => {
            if (err) {
              console.log('Error running sql: ' + sql)
              console.log(err)
              reject(err)
            } else {
              resolve(result)
            }
          })
        })
      }
    
    //lenh lay tat ca cac dong
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
          this.db.all(sql, params, (err, rows) => {
            if (err) {
              console.log('Error running sql: ' + sql)
              console.log(err)
              reject(err)
            } else {
              resolve(rows)
            }
          })
        })
     }

     //insert
     insert(name, description, isComplete, projectId) {
        return this.runSql(
          `INSERT INTO tasks (name, description, isComplete, projectId)
            VALUES (?, ?, ?, ?)`,
          [name, description, isComplete, projectId])
      }

     //update 
     update(task) {
        const { id, name, description, isComplete, projectId } = task
        return this.runSql(
          `UPDATE tasks
          SET name = ?,
            description = ?,
            isComplete = ?,
            projectId = ?
          WHERE id = ?`,
          [name, description, isComplete, projectId, id]
        )
      }

      //delete
      delete(id) {
        return this.runSql(
          `DELETE FROM projects WHERE id = ?`,
          [id]
        )
      }

}

module.exports = AppDAO; 