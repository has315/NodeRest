var express = require('express');
var router = express.Router();
var connection = require('../db');
var zombie = require('../test/zombie');

router.get('/', function(req, res, next) {
  let sql = 'SELECT * from vote';
	  connection.query(sql, function (error, results, fields) {
		if (error) throw error;
		res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
	});
});

router.post('/', function(req, res, next){
  let data  = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    jmbg: req.body.jmbg,
    phone_number: req.body.phone_number,
    delegated: req.body.delegated,
    added: req.body.added,
    voting_location: zombie.get_cik(data)
  };


  let sql = "INSERT INTO vote SET ?";
    connection.query(sql,data, (err, results) => {
    if(err) throw err;
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
    sql: `SELECT * FROM vote WHERE ${req.query.key} LIKE '${req.query.value}%'`
  }, (error, results, fields) => {
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});

module.exports = router;
