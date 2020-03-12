const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');

const connection = require('../db/mysql');
const redisClient = require("../db/redis").client;
const AppConfig = require('../db/config').AppConfig;
const saltRounds = 10;
const HSET = 'activeUsers';


router.get('/', function (req, res, next) {
  let sql = 'SELECT * from viewUsers';
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.status(HttpStatus.OK).send(JSON.stringify({
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
    res.status(HttpStatus.OK).send(JSON.stringify({
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
    res.status(HttpStatus.OK).send(JSON.stringify({
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
    res.status(HttpStatus.OK).send(JSON.stringify({
      "error": null,
      "response": results
    }));
  });
});

// router.post('/login', function (req, res, next) {

//   let sql_check = "SELECT EXISTS(SELECT * FROM `user` WHERE `username` =  ?)";
  // connection.query(sql_check, req.body.username, (err, results) => {
  //   if (err) throw err;
  //   let resultsJson = JSON.parse(JSON.stringify(results));
  //   const existsJson = Object.values(resultsJson[0])[0];
  //   if(existsJson == 0) {
  //   bcrypt.compare(req.body.password, results[0].password, function (err, response) {
  //     if (response) {
  //       console.log('after response')
  //       // Generate JWT
  //       const token = jwt.sign({ id: results[0].id }, AppConfig.SECRET, { expiresIn: AppConfig.TOKEN_LIFESPAN });
  //       const refreshToken = jwt.sign({ id: results[0].id }, AppConfig.REFRESH_TOKEN_SECRET, { expiresIn: AppConfig.REFRESH_TOKEN_LIFESPAN });
  //       const fun = function (err, reply) {
  //         if (err)
  //           throw err;
  //         if (reply)
  //           console.log(reply);
  //       };
  //       // Store refreshToken in Redis
  //       redisClient.set("key", "value", fun);
  //       redisClient.hmset(HSET, results[0].id, refreshToken, fun);
  //       if(err) throw err;
  //       // Send response
  //       res.status(HttpStatus.OK).send(JSON.stringify({
  //         "error": null,
  //         "response": results[0].account_level,
  //         "token": token,
  //         "refreshToken": refreshToken,
  //       }));
  //     } else {
  //       res.status(HttpStatus.UNAUTHORIZED).send(JSON.stringify({
  //         "error": null,
  //         "response": -1
  //       }));
  //     }      
  //   });
  // } else {
  //   res.status(HttpStatus.UNAUTHORIZED).send(JSON.stringify({
  //     "error": null,
  //     "response": -1
  //   }));
  // }
  // });
  // console.log(req.body.username);
// });

// router.post('/login', function (req, res, next) {

//   let sql_check = "SELECT EXISTS(SELECT * FROM `user` WHERE `username` =  ?)";

//  connection.query(sql_check, req.body.username, (err, results) => {
//    console.log(req.body.username);
//     if (err) throw err;
//     let resultsJson = JSON.parse(JSON.stringify(results));
//     const existsJson = Object.values(resultsJson[0])[0];
//     if(existsJson == 0) {
//       bcrypt.compare(req.body.password, results[0].password, function (err, response) {
//         console.log(results[0].password);
//       if (response) {
//         // Generate JWT
//         const token = jwt.sign({ id: results[0].id }, AppConfig.SECRET, { expiresIn: AppConfig.TOKEN_LIFESPAN });
//         const refreshToken = jwt.sign({ id: results[0].id }, AppConfig.REFRESH_TOKEN_SECRET, { expiresIn: AppConfig.REFRESH_TOKEN_LIFESPAN });
//         const fun = function (err, reply) {
//           if (err)
//             throw err;
//           if (reply)
//             console.log(reply);
//         };
//         // Store refreshToken in Redis
//         redisClient.set("key", "value", fun);
//         redisClient.hmset(HSET, results[0].id, refreshToken, fun);

//         // Send response
//         res.status(HttpStatus.OK).send(JSON.stringify({
//           "error": null,
//           "response": results[0].account_level,
//           "token": token,
//           "refreshToken": refreshToken,
//         }));
//       } else {
//         res.status(HttpStatus.UNAUTHORIZED).send(JSON.stringify({
//           "error": null,
//           "response": -1
//         }));
//       }
//     });
//   } else {
//     res.status(HttpStatus.UNAUTHORIZED).send(JSON.stringify({
//       "error": null,
//       "response": -1
//     }));
//   }
// });
// });

router.post('/login', function (req, res, next) {

  connection.query({
    sql: 'SELECT * FROM `user` WHERE `username` = ?',
    values: req.body.username
  }, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    console.log(results.password);
    bcrypt.compare(req.body.password, results[0].password, function (err, response) {
      if (response) {
        // Generate JWT
        const token = jwt.sign({ id: results[0].id }, AppConfig.SECRET, { expiresIn: AppConfig.TOKEN_LIFESPAN });
        const refreshToken = jwt.sign({ id: results[0].id }, AppConfig.REFRESH_TOKEN_SECRET, { expiresIn: AppConfig.REFRESH_TOKEN_LIFESPAN });
        const fun = function (err, reply) {
          if (err)
            throw err;
          if (reply)
            console.log(reply);
        };
        // Store refreshToken in Redis
        redisClient.set("key", "value", fun);
        redisClient.hmset(HSET, results[0].id, refreshToken, fun);

        // Send response
        res.status(HttpStatus.OK).send(JSON.stringify({
          "error": null,
          "response": results[0].account_level,
          "token": token,
          "refreshToken": refreshToken,
        }));
      } else {
        res.status(HttpStatus.UNAUTHORIZED).send(JSON.stringify({
          "error": null,
          "response": -1
        }));
      }
    });
  });
});
module.exports = router;