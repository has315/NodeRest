const connection = require("../db/mysql");



function execUpdateVotes() {

    const sql = 'select * from vote where voting_location is null';

    connection.query(sql, function(req, res) {
        console.log(res);
        console.log(JSON.stringify(res));

    });

}