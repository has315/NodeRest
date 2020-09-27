var mysql = require("mysql");

//create connection    
let connection = mysql.createPool({
    connectionLimit: 100,
    connectTimeout: 5000,
    host: 'localhost',
    user: 'pgraf_glas',
    password: 'Fnligvu5abca@',
    database: 'PgrafDB'
});
//export connection, you can optionally use 
//connection.connect here. The same state of this module is passed everywhere. 
module.exports = connection;