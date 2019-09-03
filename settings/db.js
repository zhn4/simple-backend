let mysql = require('mysql')

let pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'test'
})

pool.getConnection((err, connection) => {
  // if (err) {
  //   if (err.code === 'PROTOCOL_CONNECTION_LOST') {
  //       console.error('Database connection was closed.')
  //   }
  //   if (err.code === 'ER_CON_COUNT_ERROR') {
  //       console.error('Database has too many connections.')
  //   }
  //   if (err.code === 'ECONNREFUSED') {
  //       console.error('Database connection was refused.')
  //   }
  // }
  if (err) console.log(err)
  if (connection) connection.release()
  return
})

module.exports = pool