//create connection    
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'pgraf_glas',
    password: 'Fnligvu5abca@',
    database: 'PgrafDB'
});
//export connection, you can optionally use 
//connection.connect here. The same state of this module is passed everywhere. 
exports.connection = connection;