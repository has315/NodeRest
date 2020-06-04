const AppConfig = require("../db/config").AppConfig;
const HttpStatus = require("http-status-codes");
const connection = require("../db/mysql");
const zombie = require("../test/zombie");
const utility = require("../helpers/utility");
const logger = require("logger").createLogger(`voters.log`);

logger.info("-================ LOGGER STARTED ================-");

// =========================== HELPER FUNCTIONS ===========================

function isValidVoter(vote) {
  let valid = true;
  if (vote.jmbg.length != 13) valid = false;
  else if (
    vote.first_name.length < 1 ||
    vote.last_name.length < 1 ||
    vote.delegated.length < 1 ||
    vote.added.length < 1
  )
    valid = false;

  return valid;
}

// =========================== CORE FUNCTIONS ===========================

// GET ONE VOTE
const getOne = (req, res) => {
  let data = {
    username: req.query.username,
    vote_id: req.query.vote_id,
  };

  let sql = "SELECT * FROM `vote` WHERE `delete_request` = 0 AND vote_id = ?";
  connection.query(sql, data.vote_id, function (error, results, fields) {
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
  if (!req.query.hasOwnProperty("id") || !req.query.id) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      status: "Error",
      message: "ID not found",
    });
  }

  utility.idCheck(req);

  var sql = "SELECT * FROM vote_full_view WHERE delete_request = 0";
  let id = req.query.id;
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
      logger.info(`ID: ${id}`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: "error",
        message: "Vote not found",
      });
    }
  };

  if (id == 1) {
    connection.query(sql, callback);
  } else {
    sql += " AND added = ?";
    connection.query(sql, id, callback);
  }
};

// INSERT NEW VOTE
const create = (req, res) => {
  let data = {
    vote_id: req.body.user_id,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    jmbg: req.body.jmbg,
    phone_number: req.body.phone_number,
    delegated: req.body.delegated,
    added: req.body.added,
  };
  if (!isValidVoter(data)) {
    res.status(HttpStatus.NOT_ACCEPTABLE).send(
      JSON.stringify({
        error: "[INVALID FORMAT]",
        response: "Invalid vote format",
      })
    );
  } else {
    let sql_check = "SELECT EXISTS(SELECT * FROM vote WHERE `jmbg` =  ?)";
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
        let sql_update = "INSERT INTO vote SET ?";
        connection.query(sql_update, data, (err, results) => {
          if (err) {
            logger.error(
              `UNABLE TO INSERT VOTE| DATA: ${JSON.stringify(data)}`
            );
            throw err;
          }
          // If insert was successful get cik data
          if (data.jmbg.length == 13) {
            zombie.get_cik(req.body);
          }
          res.status(HttpStatus.OK).send(
            JSON.stringify({
              error: err,
              response: existsJson,
            })
          );
        });
      } else {
        res.status(HttpStatus.OK).send(
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

    let sql =
      "UPDATE vote SET first_name=?, last_name=?, jmbg=?, phone_number=?, delegated=? WHERE vote_id=?";
    connection.query(
      sql,
      [
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

    let sql = "DELETE FROM `vote` WHERE vote_id = ?";

    connection.query(sql, data.vote_id, (err, results) => {
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
  let sql = "SELECT * FROM `vote_edit_full_view`";
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    connection.query(sql, function (error, results, fields) {
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

  let sql = "INSERT INTO vote_edit SET ?";
  connection.query(sql, data, (err, results) => {
    if (err) {
      logger.error(
        `UNABLE TO INSERT EDIT REQUEST | DATA: ${JSON.stringify(data)}`
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

// ACCEPT EDTITED VOTE
const acceptEditReq = (req, res) => {
  for (const vote of req.body.votes) {
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
      zombie.get_cik(data);

      let sql = "CALL edit_req_accept(?,?,?,?,?,?,?)";
      connection.query(sql, data, (err, results) => {
        if (err) {
          logger.error(
            `UNABLE TO ACCEPT EDIT REQUEST | DATA: ${JSON.stringify(data)}`
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

    let sql = "DELETE FROM `vote_edit` WHERE vote_id = ?";
    connection.query(sql, data.vote_id, (err, results) => {
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
  let sql = "SELECT * FROM `vote` WHERE `delete_request` = 1";
  connection.query(sql, function (error, results, fields) {
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

  let sql = "UPDATE `vote` SET `delete_request` = 1 WHERE `jmbg` = ?";
  connection.query(sql, data.jmbg, (err, results) => {
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

    let sql = "UPDATE `vote` SET `delete_request` = 0 WHERE vote_id = ?";
    connection.query(sql, data.vote_id, (err, results) => {
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
