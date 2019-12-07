var express = require('express');
var router = express.Router();
var connection = require('../db');


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

router.post('/', function (req, res, next) {
  let data = {
    username: req.body.username,
    password: req.body.password
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

router.delete('/', function (req, res, next) {
  let data = {
    selected: req.params.selected
  };
  console.log(req.params);
  console.log(req.params.selected);
  let sql = "DELETE from user WHERE user_id = ?"
  connection.query(sql, data, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({
      "stauts": 200,
      "error": null,
      "response": results,
    }));
  });
});
module.exports = router;