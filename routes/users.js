var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
	res.locals.connection.query('SELECT * from user', function (error, results) {
		if (error) throw error;
		res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
	});
});

router.post('/', function(req, res, next){
  let data  = {
    username: req.body.username,
    password: req.body.password
  };

  let sql = "INSERT INTO user SET ?";
  let query = res.locals.connection.query(sql,data, (err, results) => {
    if(err) throw err;
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": results
    }));
  });
});

module.exports = router;