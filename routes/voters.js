var express = require('express');
var router = express.Router();
var connection = require('../db');
var zombie = require('../test/zombie');

router.get('/', function (req, res, next) {
  let sql = 'SELECT * FROM `vote` WHERE `delete_request` = 0';
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});

router.get('/get_edit', function (req, res, next) {
  let sql = 'SELECT * FROM `vote_edit`';
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});

router.post('/edit_request', function (req, res, next) {

  let data = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    jmbg: req.body.jmbg,
    phone_number: req.body.phone_number,
    delegated: req.body.delegated,
    added: req.body.added
  }
  zombie.get_cik(data);

  let sql = "INSERT INTO vote_edit SET ?";
  connection.query(sql, data, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});

router.post('/edit_request_decline', function (req, res, next) {

  let data = {
    jmbg: req.body.jmbg
  }

  let sql = "DELETE FROM `vote` WHERE jmbg = ?";
  connection.query(sql, data, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});

router.get('/get_one', function (req, res, next) {
  data = {
    username: req.query.username,
    jmbg: req.query.jmbg
  }

  let sql = 'SELECT * FROM `vote` WHERE `delete_request` = 0 AND jmbg = ?';
  connection.query(sql, data.jmbg, function (error, results, fields) {
    if (error) throw error;
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});

router.get('/get_deleted', function (req, res, next) {
  let sql = 'SELECT * FROM `vote` WHERE `delete_request` = 1';
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});

router.post('/', function (req, res, next) {
  let data = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    jmbg: req.body.jmbg,
    phone_number: req.body.phone_number,
    delegated: req.body.delegated,
    added: req.body.added
  };

  zombie.get_cik(data);

  let sql = "INSERT INTO vote SET ?";
  connection.query(sql, data, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});

router.get('/search', function (req, res, next) {
  let data = [req.query.key, req.query.value]

  // sql: `SELECT * FROM vote WHERE ${req.query.key} LIKE '${req.query.value}%'`
  sql = `SELECT * FROM vote WHERE ? LIKE '?%'`
  connection.query(sql, data, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});


router.post('/delete_request', function (req, res, next) {
  let data = {
    jmbg: req.body.jmbg
  };

  let sql = 'UPDATE `vote` SET `delete_request` = 1 WHERE `jmbg` = ?';
  connection.query(sql, data.jmbg, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({
      "stauts": 200,
      "error": null,
      "response": results,
    }));
  });
});

router.post('/delete', function (req, res, next) {
  let data = {
    jmbg: req.body.jmbg
  };

  let sql = 'DELETE FROM `vote` WHERE jmbg = ?';
  connection.query(sql, data.jmbg, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({
      "stauts": 200,
      "error": null,
      "response": results,
    }));
  });
});

router.post('/delete_decline', function (req, res, next) {
  let data = {
    jmbg: req.body.jmbg
  };

  let sql = 'UPDATE `vote` SET `delete_request` = 0 WHERE jmbg = ?';
  connection.query(sql, data.jmbg, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({
      "stauts": 200,
      "error": null,
      "response": results,
    }));
  });
});



module.exports = router;