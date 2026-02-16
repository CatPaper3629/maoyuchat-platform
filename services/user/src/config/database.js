require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'chat_user',
  password: process.env.MYSQL_PASSWORD || 'chat_password',
  database: process.env.MYSQL_DATABASE || 'chat_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;