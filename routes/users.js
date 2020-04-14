const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const HttpStatus = require('http-status-codes');
const auth = require('../middleware/auth');

const connection = require('../db/mysql');
const redisClient = require("../db/redis").client;
const jwt_redis = require('jwt-redis');
const JWTR = jwt_redis.default;
const jwt = new JWTR(redisClient);
const AppConfig = require('../db/config').AppConfig;
const saltRounds = 10;


router.get('/', auth.authAdmin, function(req, res, next) {
    let sql = 'SELECT * from viewUsers';
    connection.query(sql, function(error, results, fields) {
        if (error) throw error;
        res.status(HttpStatus.OK).send(JSON.stringify({
            "error": null,
            "response": results
        }));
    });
});

router.get('/get_one', auth.authUser, function(req, res, next) {
    let data = {
        username: req.query.username
    }
    let sql = 'SELECT `user_id`, `username`, `account_level` FROM `user` WHERE `username` = ?';
    connection.query(sql, data.username, function(error, results, fields) {
        if (error) throw error;
        res.status(HttpStatus.OK).send(JSON.stringify({
            "error": null,
            "response": results
        }));
    });
});

router.get('/search', auth.authAdmin, function(req, res, next) {
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

router.post('/', auth.authAdmin, function(req, res, next) {
    let data = {
        username: req.body.username,
        password: req.body.password,
        // password: bcrypt.hashSync(req.body.password, 14),

    };
    if (data.password.length > 7) {

        let sql_check = "SELECT EXISTS(SELECT * FROM user WHERE `username` =  ?)";
        connection.query(sql_check, data.username, (err, results) => {
            if (err) throw err;
            let resultsJson = JSON.parse(JSON.stringify(results));
            const existsJson = Object.values(resultsJson[0])[0];
            if (existsJson == 0) {
                let sql = "INSERT INTO user SET ?";
                connection.query(sql, data, (err, results) => {
                    if (err) throw err;
                    res.status(HttpStatus.OK).send(JSON.stringify({
                        "error": null,
                        "response": results
                    }));
                });
            }
        });
    } else {
        res.status(HttpStatus.BAD_REQUEST).send(JSON.stringify({
            "error": 'requirments not met'
        }))
    }
});

router.post('/login', function(req, res, next) {

    connection.query({
        sql: "SELECT EXISTS(SELECT * FROM user WHERE `username` =  ?)",
        values: req.body.username
    }, function(error, results, fields) {
        if (error) throw error;
        let resultsJson = JSON.parse(JSON.stringify(results));
        const existsJson = Object.values(resultsJson[0])[0];
        if (existsJson == 1) {
            sql = 'SELECT * FROM `user` WHERE `username` = ?';
            var data = {
                username: req.body.username,
                password: req.body.password
            }
            connection.query(sql, data.username, (err, results) => {
                bcrypt.compare(data.password, results[0].password, function(err, success) {
                    if (err)
                        throw err;
                    if (success) {
                        // Generate JWT
                        let user = {
                            user_id: results[0].user_id,
                            username: results[0].username,
                            account_level: results[0].account_level,
                        }
                        jwt.sign(user, AppConfig.SECRET, { expiresIn: '1h' }).then(token => {
                            // Send response
                            res.status(HttpStatus.OK).send(JSON.stringify({
                                "error": null,
                                "response": results[0].user_id,
                                "account_level": results[0].account_level,
                                "token": token,
                            }));
                        }).catch(err => {
                            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(JSON.stringify({
                                "error": err,
                                "response": -1
                            }));
                        });

                    } else {
                        res.status(HttpStatus.UNAUTHORIZED).send(JSON.stringify({
                            "error": null,
                            "response": -1
                        }));
                    }
                });
            })
        } else {
            res.status(HttpStatus.UNAUTHORIZED).send(JSON.stringify({
                "error": null,
                "response": -1
            }));
        }
    });
});

router.post('/delete', auth.authAdmin, function(req, res, next) {
    let data = {
        user_id: req.body.user_id
    };

    let sql = "DELETE FROM `user` WHERE user_id = ?";

    connection.query(sql, data.vote_id, (err, results) => {
        if (err) throw err;
        res.status(HttpStatus.OK).send(JSON.stringify({
            "error": null,
            "response": results,
        }));
    });
});

module.exports = router;