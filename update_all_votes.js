const connection = require("./db/mysql");
const logger = require("logger").createLogger(`aa.log`);
const zombie = require('./test/zombie');


logger.info("-================ LOGGER STARTED ================-");

function execUpdateVotes() {
    logger.info("-================ FUNCTION CALL");

    const sql = 'select * from vote where voting_location is null';

    connection.query(sql, function(req, res) {
        if (res) {
            const a = JSON.stringify(res);
            for (const vote in a) {
                let count = 0
                console.log(count)
                zombie.get_cik(vote);
                count++
            }
        }
    });

}

execUpdateVotes()