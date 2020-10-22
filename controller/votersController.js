const AppConfig = require("../db/config").AppConfig;
const HttpStatus = require("http-status-codes");
const connection = require("../db/mysql");
const zombie = require("../test/zombie");
const logger = require("logger").createLogger(`voters.log`);
const async = require("async");
const cik = require("../test/cik");

logger.info("-================ LOGGER STARTED ================-");

// =========================== GLOBAL VARIABLES ===========================

const SQL = {
    GET_ALL_VOTES: "SELECT * FROM vote_full_view WHERE delete_request = 0",
    GET_ONE_VOTE: "SELECT * FROM `vote` WHERE `delete_request` = 0 AND vote_id = ?",
    INSERT_VOTE: "INSERT INTO vote SET ?",
    UPDATE_VOTE: "UPDATE vote SET first_name=?, last_name=?, jmbg=?, phone_number=?, delegated=? WHERE vote_id=?",
    DELETE_VOTE: "DELETE FROM `vote` WHERE vote_id = ?",
    CHECK_IF_EXISTS: "SELECT EXISTS(SELECT * FROM vote WHERE `jmbg` =  ?)",

    GET_ALL_EDIT_REQ: "SELECT * FROM `vote_edit_full_view`",
    INSERT_EDIT_REQ: "INSERT INTO vote_edit SET ?",
    ACCEPT_EDIT_REQ: "CALL edit_req_accept(pVoteId,pAdded,pFirstName,pLastName,pJMBG,pDelegated,pPhoneNumber)",
    DELETE_EDIT_REQ: "DELETE FROM `vote_edit` WHERE vote_id = ?",

    GET_ALL_DEL_REQ: "SELECT * FROM `vote` WHERE `delete_request` = 1",
    SET_DEL_REQ: "UPDATE `vote` SET `delete_request` = 1 WHERE `jmbg` = ?",
    UNSET_DEL_REQ: "UPDATE `vote` SET `delete_request` = 0 WHERE vote_id = ?",
};

const NULL_KEYS = ['vote_id']

// =========================== HELPER FUNCTIONS ===========================

function canBeNull(key) {
    NULL_KEYS.forEach(element => {
        if (element == key) {
            return true;
        }
    });
    return false;
}

function isValidVoter(vote) {
    let valid = true;
    console.log('Obj entries: ' + Object.entries(vote));
    for (let [key, value] of Object.entries(vote)) {
        if (value === null || value === undefined || value.toString().length < 1) {
            if (canBeNull(key)) {
                continue
            }
            console.log(`INVALID BECAUSE OF ${key} = ${value}`);
            valid = false;
            break;
        }
    }
    return valid;
}

// =========================== CORE FUNCTIONS ===========================

// GET ONE VOTE
const getOne = (req, res) => {
    let data = {
        username: req.query.username,
        vote_id: req.query.vote_id,
    };

    connection.query(SQL.GET_ONE_VOTE, data.vote_id, function(error, results) {
        if (error) {
            logger.error(`UNABLE TO GET VOTE | DATA: ${data.vote_id}`);
            throw error;
        }
        res.status(HttpStatus.OK).send(
            JSON.stringify({
                error: null,
                response: results,
            })
        );
    });
};

// GET ALL NON DELETED VOTES
const getAll = (req, res) => {
    let user_id = req.decoded.user_id;
    let account_level = req.decoded.account_level;
    let sql = SQL.GET_ALL_VOTES;

    let callback = (err, results) => {
        if (err) {
            logger.error(`ID: ${id} FAILED QUERY: ${sql}`);
            throw err;
        }
        if (results)
            res.status(HttpStatus.OK).send(
                JSON.stringify({
                    error: null,
                    response: results,
                })
            );
        else {
            return res.status(HttpStatus.NOT_FOUND).json({
                status: "error",
                message: "Vote not found",
            });
        }
    };

    if (account_level == 1) {
        connection.query(sql, callback);
    } else {
        sql += " AND added = ?";
        connection.query(sql, user_id, callback);
    }
};

// INSERT NEW VOTE
const create = (req, res) => {
    let data = {
        vote_id: 0,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        jmbg: req.body.jmbg,
        phone_number: req.body.phone_number,
        delegated: req.body.delegated,
        added: req.body.added,
    };
    console.log(`from insert ${JSON.stringify(data)}`);
    if (!isValidVoter(data)) {
        res.status(HttpStatus.NOT_ACCEPTABLE).send(
            JSON.stringify({
                error: "[INVALID FORMAT]",
                response: "Invalid vote format",
            })
        );
    } else {
        let sql_check = SQL.CHECK_IF_EXISTS;
        connection.query(sql_check, data.jmbg, (err, results) => {
            if (err) {
                logger.error(
                    `UNABLE TO CHECK IF DATA EXISTS | DATA: ${JSON.stringify(data)}`
                );
                throw err;
            }
            let resultsJson = JSON.parse(JSON.stringify(results));
            const existsJson = Object.values(resultsJson[0])[0];
            if (existsJson == 0) {
                connection.query(SQL.INSERT_VOTE, data, (err, results) => {
                    if (err) {
                        logger.error(
                            `UNABLE TO INSERT VOTE| DATA: ${JSON.stringify(data)}`
                        );
                        throw err;
                    }
                    // If insert was successful get cik data
                    data.vote_id = results.insertId;

                    cik.get_cik(data);
                });
            } else {
                res.status(HttpStatus.EXPECTATION_FAILED).send(
                    JSON.stringify({
                        error: err,
                        response: existsJson,
                    })
                );
            }
        });
    }
};

// UPDATE VOTE
const update = (req, res) => {
    let data = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        jmbg: req.body.jmbg,
        phone_number: req.body.phone_number,
        delegated: req.body.delegated,
        vote_id: req.body.vote_id,
    };

    if (!isValidVoter(data)) {
        res.status(HttpStatus.NOT_ACCEPTABLE).send(
            JSON.stringify({
                error: err,
                response: "Invalid vote format",
            })
        );
    } else {
        zombie.get_cik(data);

        connection.query(
            SQL.UPDATE_VOTE, [
                data.first_name,
                data.last_name,
                data.jmbg,
                data.phone_number,
                data.delegated,
                data.vote_id,
            ],
            (err, results) => {
                if (err) {
                    logger.error(`UNABLE TO UPDATE VOTE | DATA: ${JSON.stringify(data)}`);
                    throw error;
                }
                // console.log(results);
                res.status(HttpStatus.OK).send(
                    JSON.stringify({
                        error: null,
                        response: results.affectedRows,
                    })
                );
            }
        );
    }
};

// DELETE VOTE
const remove = (req, res) => {
    const voteIds = req.body.votes.map((el) => el.vote_id);
    for (const voteId of voteIds) {
        let data = {
            vote_id: voteId,
        };

        connection.query(SQL.DELETE_VOTE, data.vote_id, (err, results) => {
            if (err) {
                logger.error(`UNABLE TO DELETE VOTE | DATA: ${JSON.stringify(data)}`);
                throw err;
            }
            res.status(HttpStatus.OK).send(
                JSON.stringify({
                    error: null,
                    response: results,
                })
            );
        });
    }
};

// SEARCH VOTES
const search = (req, res) => {
    // Escape input to prevent SQL Injection
    let data = {
        key: connection.escape(req.query.key).replace(/'/g, ""),
        value: connection.escape(req.query.value + "%").replace(/'/g, ""),
        id: connection.escape(req.query.id).replace(/'/g, ""),
    };

    // If the [data.key] is voting_location_address or voting_location_name then find all rows which have [data.value] in the provided column name
    if (
        data.key === "voting_location_address" ||
        data.key === "voting_location_name"
    ) {
        data.value = "%" + data.value;
    }
    // By default search should find all rows which [data.key] column starts with [data.value]
    sql = `SELECT * FROM vote_full_view WHERE ${data.key} LIKE '${data.value}'`;

    // Only admin can search all votes
    // Clients can search only the votes which they have added
    if (data.id != 1) {
        sql += ` AND added = ${data.id}`;
    }

    connection.query(sql, [], (err, results) => {
        if (err) {
            logger.error(`UNABLE TO SEARCH | DATA: ${JSON.stringify(data)}`);
            throw err;
        }
        res.status(HttpStatus.OK).send(
            JSON.stringify({
                error: null,
                response: results,
            })
        );
    });
};

// GET ALL EDITED VOTES
const getAllEditReq = (req, res) => {
    connection.query(SQL.GET_ALL_EDIT_REQ, function(error, results, fields) {
        if (error) {
            logger.error("UNABLE TO GET ALL EDITED VOTES");
            throw error;
        }
        res.status(HttpStatus.OK).send(
            JSON.stringify({
                error: null,
                response: results,
            })
        );
    });
};

// INSERT EDITED VOTE
const createEditReq = (req, res) => {
    let data = {
        vote_id: req.body.vote_id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        jmbg: req.body.jmbg,
        phone_number: req.body.phone_number,
        delegated: req.body.delegated,
        added: req.body.added,
    };

    connection.query(SQL.INSERT_EDIT_REQ, data, (err, results) => {
        if (err) {
            logger.error(
                `UNABLE TO INSERT EDIT REQUEST | DATA: ${JSON.stringify(data)}`
            );
            throw err;
        }
        res.status(HttpStatus.OK).send(
            JSON.stringify({
                error: null,
                response: results.affectedRows,
            })
        );
    });
};

// ACCEPT EDTITED VOTE
const acceptEditReq = (req, res) => {
    for (const vote of req.body.votes) {
        console.log('vote' + vote);
        console.log('votes ' + req.body.votes);
        let data = {
            vote_id: vote.vote_id,
            added: vote.added,
            first_name: vote.first_name,
            last_name: vote.last_name,
            jmbg: vote.jmbg,
            delegated: vote.delegated,
            phone_number: vote.phone_number,
        };

        if (!isValidVoter(data)) {
            res.status(HttpStatus.NOT_ACCEPTABLE).send(
                JSON.stringify({
                    error: err,
                    response: "Invalid vote format",
                })
            );
        } else {
            let sql = SQL.ACCEPT_EDIT_REQ.replace(
                    "pVoteId",
                    connection.escape(data.vote_id)
                )
                .replace("pAdded", connection.escape(data.added))
                .replace("pFirstName", connection.escape(data.first_name))
                .replace("pLastName", connection.escape(data.last_name))
                .replace("pJMBG", connection.escape(data.jmbg))
                .replace("pDelegated", connection.escape(data.delegated))
                .replace("pPhoneNumber", connection.escape(data.phone_number));
            connection.query(sql, (err, results) => {
                if (err) {
                    logger.error(
                        `UNABLE TO ACCEPT EDIT REQUEST | DATA: ${JSON.stringify(data)}`
                    );
                    res.status(HttpStatus.BAD_REQUEST).send(JSON.stringify({
                        error: err,
                        response: results
                    }))
                    throw err;
                }

                zombie.get_cik(data);
                res.status(HttpStatus.OK).send(
                    JSON.stringify({
                        error: null,
                        response: results.affectedRows,
                    })
                );
            });
        }
    }
};

// DECLINE AND DELETE VOTE EDIT ENTRY
const removeEditReq = (req, res) => {
    const voteIds = req.body.votes.map((el) => el.vote_id);
    console.log(voteIds);

    for (const voteId of voteIds) {
        let data = {
            vote_id: voteId,
        };

        connection.query(SQL.DELETE_EDIT_REQ, data.vote_id, (err, results) => {
            if (err) {
                logger.error(
                    `UNABLE TO DELETE VOTE EDIT | DATA: ${JSON.stringify(data)}`
                );
                throw err;
            }
            res.status(HttpStatus.OK).send(
                JSON.stringify({
                    error: null,
                    response: results,
                })
            );
        });
    }
};

// GET ALL DELETE REQUESTS
const getAllDelReq = (req, res) => {
    connection.query(SQL.GET_ALL_DEL_REQ, function(error, results, fields) {
        if (error) {
            logger.error("UNABLE TO GET DELETE REQUEST");
            throw error;
        }
        res.status(HttpStatus.OK).send(
            JSON.stringify({
                error: null,
                response: results,
            })
        );
    });
};

// SETS FLAG FOR DELETION
const createDelReq = (req, res) => {
    let data = {
        jmbg: req.body.jmbg,
    };

    connection.query(SQL.SET_DEL_REQ, data.jmbg, (err, results) => {
        if (err) {
            logger.error(
                `UNABLE TO SET FLAG FOR DELETION | DATA: ${JSON.stringify(data)}`
            );
            throw err;
        }
        res.status(HttpStatus.OK).send(
            JSON.stringify({
                error: null,
                response: results,
            })
        );
    });
};

// DECLINE DELETE AND  SETS DELETION FLAG TO 0
const removeDelReq = (req, res) => {
    const voteIds = req.body.votes.map((el) => el.vote_id);
    console.log(voteIds);

    for (const voteId of voteIds) {
        let data = {
            vote_id: voteId,
        };

        connection.query(SQL.UNSET_DEL_REQ, data.vote_id, (err, results) => {
            if (err) {
                logger.error(
                    `UNABLE TO DECLINE DELETION | DATA: ${JSON.stringify(data)}`
                );
                throw err;
            }
            res.status(HttpStatus.OK).send(
                JSON.stringify({
                    error: null,
                    response: results,
                })
            );
        });
    }
};

// ======================================================================

module.exports = {
    getOne,
    getAll,
    create,
    update,
    remove,
    search,
    getAllEditReq,
    createEditReq,
    acceptEditReq,
    removeEditReq,
    getAllDelReq,
    createDelReq,
    removeDelReq,
};