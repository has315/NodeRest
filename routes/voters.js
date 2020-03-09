const express = require('express');
const router = express.Router();
const connection = require('../db/mysql');
const zombie = require('../test/zombie');
const HttpStatus = require('http-status-codes');


// GET ALL NON DELETED VOTES
router.get('/all', function (req, res, next) {
  if (!req.query.hasOwnProperty('id') || !req.query.id) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      status: 'Error',
      message: 'ID not found'
    });
  }

  var sql = 'SELECT * FROM vote_full_view WHERE delete_request = 0';
  let id = req.query.id;
  let callback = (err, results) => {
    if (err) throw err;
    if (results)
      res.status(HttpStatus.OK).send(JSON.stringify({
        "error": null,
        "response": results
      }));
    else {
      return res.status(HttpStatus.NOT_FOUND).json({
        status: "error",
        message: "Vote not found"
      });
    }
  };

  if (id == 1) {
    connection.query(sql, callback);
  } else {
    sql += ' AND added = ?';
    connection.query(sql, id, callback);
  }
});

// GET ALL EDITED VOTES
router.get('/get_edit', function (req, res, next) {
  let sql = 'SELECT * FROM `vote_edit_full_view`';
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.status(HttpStatus.OK).send(JSON.stringify({
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
    res.status(HttpStatus.OK).send(JSON.stringify({
      "error": null,
      "response": results
    }));
  });
});

// GET ONE VOTE RECORD 
router.get('/get_one', function (req, res, next) {
  let data = {
    username: req.query.username,
    vote_id: req.query.vote_id
  }

  let sql = "SELECT * FROM `vote` WHERE `delete_request` = 0 AND vote_id = ?";
  connection.query(sql, data.vote_id, function (error, results, fields) {
    if (error) throw error;
    res.status(HttpStatus.OK).send(JSON.stringify({
      "error": null,
      "response": results
    }));
  });
});

// INSERT EDITED VOTE
router.post('/edit_request', function (req, res, next) {
  let data = {
    vote_id: req.body.vote_id,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    jmbg: req.body.jmbg,
    phone_number: req.body.phone_number,
    delegated: req.body.delegated,
    added: req.body.added
  };
  zombie.get_cik(data);

  let sql = "INSERT INTO vote_edit SET ?";
  connection.query(sql, data, (err, results) => {
    if (err) throw err;
    res.status(HttpStatus.OK).send(JSON.stringify({
      "error": null,
      "response": results
    }));
  });
});


router.post('/update', function (req, res, next) {
  let data = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    jmbg: req.body.jmbg,
    phone_number: req.body.phone_number,
    delegated: req.body.delegated,
    vote_id: req.body.vote_id
  };
  zombie.get_cik(data);

  let sql = "UPDATE vote SET first_name=?, last_name=?, jmbg=?, phone_number=?, delegated=? WHERE vote_id=?";
  connection.query(sql, [data.first_name, data.last_name, data.jmbg, data.phone_number, data.delegated, data.vote_id], (err, results) => {
    if (err) throw err;
    // console.log(results);
    res.status(HttpStatus.OK).send(JSON.stringify({
      "error": null,
      "response": results.affectedRows
    }));
  });
});


// DECLINE AND DELETE VOTE EDIT ENTRY
router.post('/edit_request_delete', function (req, res, next) {
  let data = {
    vote_id: req.body.vote_id
  }

  let sql = "DELETE FROM `vote_edit` WHERE vote_id = ?";
  connection.query(sql, data.vote_id, (err, results) => {
    if (err) throw err;
    res.status(HttpStatus.OK).send(JSON.stringify({
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


  let sql_check = "SELECT EXISTS(SELECT * FROM vote WHERE `jmbg` =  ?)";
  connection.query(sql_check, data.jmbg, (err, results) => {
    if (err) throw err;
    let resultsJson = JSON.parse(JSON.stringify(results));
    const existsJson = Object.values(resultsJson[0])[0];
    if (existsJson == 0) {
      let sql_update = "INSERT INTO vote SET ?"
      connection.query(sql_update, data, (err, results) => {
        if (err) throw err;
        // If insert was successful get cik data
        zombie.get_cik(data);
        res.status(HttpStatus.OK).send(JSON.stringify({
          "error": null,
          "response": existsJson
        }));
      });
    } else {
      res.status(HttpStatus.OK).send(JSON.stringify({
        "error": null,
        "response": existsJson
      }));
    }
  });
});

// SEARCH FUNCTIONALITY
router.get('/search', function (req, res, next) {
  // Escape input to prevent SQL Injection
  let data = {
    key: connection.escape(req.query.key).replace(/'/g, ""),
    value: connection.escape(req.query.value + "%").replace(/'/g, ""),
    id: connection.escape(req.query.id).replace(/'/g, "")
  };

  // If the [data.key] is voting_location_address or voting_location_name then find all rows which have [data.value] in the provided column name
  if (data.key === "voting_location_address" || data.key === "voting_location_name") {
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
    if (err) throw err;
    res.status(HttpStatus.OK).send(JSON.stringify({
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
    res.status(HttpStatus.OK).send(JSON.stringify({
      "error": null,
      "response": results,
    }));
  });
});

// DELETE FROM VOTE
router.post('/delete', function (req, res, next) {
  let data = {
    vote_id: req.body.vote_id
  };

  let sql = 'DELETE FROM `vote` WHERE vote_id = ?; DELETE FROM `vote_edit_full_view` WHERE vote_id = ?';

  connection.query(sql, data.vote_id, (err, results) => {
    if (err) throw err;
    res.status(HttpStatus.OK).send(JSON.stringify({
      "error": null,
      "response": results,
    }));
  });
});

// DECLINE DELETE AND  SETS DELETION FLAG TO 0
router.post('/delete_decline', function (req, res, next) {
  let data = {
    jmbg: req.body.jmbg
  };

  let sql = 'UPDATE `vote` SET `delete_request` = 0 WHERE jmbg = ?';
  connection.query(sql, data.jmbg, (err, results) => {
    if (err) throw err;
    res.status(HttpStatus.OK).send(JSON.stringify({
      "error": null,
      "response": results,
    }));
  });
});



module.exports = router;