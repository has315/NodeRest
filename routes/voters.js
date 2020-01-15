var express = require('express');
var router = express.Router();
var connection = require('../db/mysql');
var zombie = require('../test/zombie');


// GET ALL NON DELETED VOTES
router.get('/all', function (req, res, next) {
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

router.get('/by_user', function (req, res, next) {
  let sql = 'SELECT * FROM `voters_full` WHERE `delete_request` = 0';
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});

// GET ALL EDITED VOTES
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

// GET ALL DELETED VOTES
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

// GET ONE VOTE RECORD 
router.get('/get_one', function (req, res, next) {
  let data = {
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

// INSERT EDITED VOTE
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


// DECLINE AND DELETE VOTE EDIT ENTRY
router.post('/edit_request_decline', function (req, res, next) {
  let data = {
    jmbg: req.body.jmbg
  }

  let sql = "DELETE FROM `vote_edit` WHERE jmbg = ?";
  connection.query(sql, data.jmbg, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});



// INSERT NEW VOTE
router.post('/', function (req, res, next) {
  let data = {
    vote_id: req.body.user_id,
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

// SEARCH FUNCTIONALITY
router.get('/search', function (req, res, next) {
  let data = {
    key: connection.escape(req.query.key).replace(/'/g, ""),
    value: connection.escape(req.query.value).replace(/'/g, "")
  };
  console.log(data);
  if (data.key === "voting_location_address" || data.key === "voting_location_name")
    sql = `SELECT * FROM vote WHERE ${data.key} LIKE '%${data.value}%'`;
  else
    sql = `SELECT * FROM vote WHERE ${data.key} LIKE '${data.value}%'`;

  connection.query(sql, [data.key, data.value], (err, results) => {
    console.log(sql);
    if (err) throw err;
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});

// SETS FLAG FOR DELETION = 1
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

// DELETE FROM VOTE
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

// DECLINE DELETION AND  SETS DELETION FLAG TO 0
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