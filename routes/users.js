var express = require('express');
var router = express.Router();
var connection = require('../db');
var client = require("../db/redis").client;
const bcrypt = require('bcrypt');
const AppConfig = require('../config').AppConfig;
const saltRounds = 10;
const HSET = "activeUsers";




router.get('/', function (req, res, next) {
  let sql = 'SELECT * from user';
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});

router.get('/get_one', function (req, res, next) {
  let data = {
    username: req.query.username
  }
  let sql = 'SELECT `user_id`, `username`, `account_level` FROM `user` WHERE `username` = ?';
  connection.query(sql, data.username, function (error, results, fields) {
    if (error) throw error;
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});

router.get('/search', function (req, res, next) {
  data = {
    username: req.query.value
  }
  //'SELECT * FROM `user` WHERE `username` LIKE  \'?%\''
  connection.query({
    sql: `SELECT * FROM user WHERE username LIKE '${req.query.value}%'`
  }, (error, results, fields) => {
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});

router.post('/', function (req, res, next) {

  let presalt = bcrypt.genSaltSync(saltRounds);

  let data = {
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, presalt),
    salt: presalt
  };

  let sql = "INSERT INTO user SET ?";
  connection.query(sql, data, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});


router.post('/login', function (req, res, next) {

  connection.query({
    sql: 'SELECT * FROM `user` WHERE `username` = ?',
    values: req.body.username
  }, function (error, results, fields) {
    if (error) throw error;
    // var salt = results[0].salt;
    // console.log(salt);

    // var hash = bcrypt.hashSync(req.body.password, salt);
    console.log(req.body.password);
    // console.log(hash);
    console.log(results[0].password)

    bcrypt.compare(req.body.password, results[0].password, function (err, response) {
      if (response) {
        // Generate JWT
        const token = jwt.sign({ id: results[0].id }, AppConfig.SECRET, { expiresIn: AppConfig.TOKEN_LIFESPAN });
        const refreshToken = jwt.sign({ id: results[0].id }, AppConfig.REFRESH_TOKEN_SECRET, { expiresIn: AppConfig.REFRESH_TOKEN_LIFESPAN });
        // Store refreshToken in Redis
        client.hset(HSET, results[0].id, refreshToken)
        // Send response
        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results[0].account_level,
          "token": token,
          "refreshToken": refreshToken,
        }));
      } else {
        res.send(JSON.stringify({
          "status": 401,
          "error": null,
          "response": -1
        }));
      }
    });
  });
});

async function checkUser(reqPassword, userPassword) {
  //... fetch user from a db etc.

  const match = await bcrypt.compare(reqPassword, userPassword);

  if (match) {
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": 1
    }));
  } else {
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": 2
    }));
  }
}
module.exports = router;