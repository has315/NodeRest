const connection = require("./db/mysql");
const logger = require("logger").createLogger(`aa.log`);


logger.info("-================ LOGGER STARTED ================-");


function execUpdateVotes() {
    logger.info("-================ FUNCTION CALL");

    const sql = 'select * from vote where voting_location is null';

    connection.query(sql, function(req, res) {
        console.log(res);
        logger.info(JSON.stringify(res));

    });

}