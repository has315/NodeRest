const HttpStatus = require("http-status-codes");
const jwt_redis = require("jwt-redis");
const JWTR = jwt_redis.default;
const redisClient = require("../db/redis").client;
const jwt = new JWTR(redisClient);
const bcrypt = require("bcryptjs");

const AppConfig = require("../db/config").AppConfig;
const connection = require("../db/mysql");
const SALT_ROUNDS = 10;
const logger = require("logger").createLogger(`users.log`);

logger.info("-================ LOGGER STARTED ================-");

// =========================== GLOBAL VARIABLES ===========================

const SQL = {
  GET_ONE = "SELECT `user_id`, `username`, `account_level` FROM `user` WHERE `username` = ?",
  GET_ALL = "SELECT * from viewUsers",
  INSERT = "INSERT INTO user SET ?",
  DELETE = "DELETE FROM `user` WHERE user_id = ?",
  CHECK_IF_EXISTS = "SELECT EXISTS(SELECT * FROM user WHERE `username` =  ?)",

};

// =========================== HELPER FUNCTIONS ===========================

// =========================== CORE FUNCTIONS ===========================

// LOGIN USER
const login = (req, res) => {
  connection.query(
    {
      sql: "SELECT EXISTS(SELECT * FROM user WHERE `username` =  ?)",
      values: req.body.username,
    },
    function (error, results, fields) {
      if (error) {
        logger.error(
          `UNABLE TO CHECK IF USER EXISTS | DATA: ${req.body.username}`
        );
        throw error;
      }
      let resultsJson = JSON.parse(JSON.stringify(results));
      const existsJson = Object.values(resultsJson[0])[0];
      if (existsJson == 1) {
        sql = "SELECT * FROM `user` WHERE `username` = ?";
        var data = {
          username: req.body.username,
          password: req.body.password,
        };
        connection.query(sql, data.username, (err, results) => {
          bcrypt.compare(data.password, results[0].password, function (
            err,
            success
          ) {
            if (err) {
              logger.error(`UNABLE TO LOGIN | DATA: ${data.vote_id}`);
              throw err;
            }
            if (success) {
              // Generate JWT
              let user = {
                user_id: results[0].user_id,
                username: results[0].username,
                account_level: results[0].account_level,
              };
              jwt
                .sign(user, AppConfig.SECRET, { expiresIn: "1h" })
                .then((token) => {
                  // Send response
                  res.status(HttpStatus.OK).send(
                    JSON.stringify({
                      error: null,
                      response: results[0].user_id,
                      account_level: results[0].account_level,
                      token: token,
                    })
                  );
                })
                .catch((err) => {
                  res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(
                    JSON.stringify({
                      error: err,
                      response: -1,
                    })
                  );
                });
            } else {
              res.status(HttpStatus.UNAUTHORIZED).send(
                JSON.stringify({
                  error: null,
                  response: -1,
                })
              );
            }
          });
        });
      } else {
        res.status(HttpStatus.UNAUTHORIZED).send(
          JSON.stringify({
            error: null,
            response: -1,
          })
        );
      }
    }
  );
};

// GET ONE USER
const getOne = (req, res) => {
  let data = {
    username: req.query.username,
  };
  connection.query(SQL.GET_ONE, data.username, function (error, results, fields) {
    if (error) {
      logger.error(`UNABLE TO GET USER | DATA: ${data.username}`);
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

// GET ALL USERS
const getAll = (req, res) => {
  connection.query(SQL.GET_ALL, function (error, results, fields) {
    if (error) {
      logger.error(`UNABLE TO GET ALL USERS`);
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

// CREATE USER
const create = (req, res) => {
  if (req.body.password.length > 7) {
    let data = {
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 14),
    };

    connection.query(SQL.CHECK_IF_EXISTS, data.username, (err, results) => {
      if (err) {
        logger.error(`UNABLE TO CHECK IF USER EXISTS | DATA: ${data.username}`);
        throw err;
      }
      let resultsJson = JSON.parse(JSON.stringify(results));
      const existsJson = Object.values(resultsJson[0])[0];
      if (existsJson == 0) {
        connection.query(SQL.INSERT, data, (err, results) => {
          if (err) {
            logger.error(`UNABLE TO INSERT NEW USER | DATA: ${data.username}`);
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
    });
  } else {
    res.status(HttpStatus.BAD_REQUEST).send(
      JSON.stringify({
        error: "requirments not met",
      })
    );
  }
};

// DELETE USER
const remove = (req, res) => {
  let data = {
    user_id: req.body.user_id,
  };

  connection.query(SQL.DELETE, data.user_id, (err, results) => {
    if (err) {
      logger.error(`UNABLE TO DELETE USER | DATA: ${data.user_id}`);
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

// SEARCH USERS
const search = (req, res) => {
  data = {
    username: req.query.value,
  };
  //'SELECT * FROM `user` WHERE `username` LIKE  \'?%\''
  connection.query(
    {
      sql: `SELECT * FROM user WHERE username LIKE '${req.query.value}%'`,
    },
    (error, results, fields) => {
      if (error) {
        logger.error(`UNABLE TO SEARCH USERS | DATA: ${req.query.value}`);
        throw error;
      }
      res.status(HttpStatus.OK).send(
        JSON.stringify({
          error: null,
          response: results,
        })
      );
    }
  );
};

// ======================================================================

module.exports = { login, getOne, getAll, create, remove, search };
