const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mb_bank_api_data'
});

connection.connect((err) => {
    if (err) {
        console.error("Kết nối cơ sở dữ liệu thất bại", err);
        return;
    }
    console.log("Kết nối cơ sở dữ liệu thành công");
});

module.exports = connection;
