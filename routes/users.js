var express = require('express');
var router = express.Router();
var connection = require('../db');
const bcrypt = require('bcrypt');
const saltRounds = 10;




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

  let presalt = bcrypt.genSaltSync(saltRounds);
  console.log(presalt);
  let data = {
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, presalt),
    salt: presalt
  };
  console.log(data);



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

// router.delete('/', function (req, res, next) {
//   let data = {user_id : req.data.selected};
//   console.log(req.params);
//   console.log(req.params.selected);
//   console.log(req.body.selected);

//   let sql = "DELETE from user WHERE user_id = ?"
//   connection.query(sql, data, (err, results) => {
//     if (err) throw err;
//     res.send(JSON.stringify({
//       "stauts": 200,
//       "error": null,
//       "response": results,
//     }));
//   });
// });

router.post('/delete', function (req, res, next) {
  let data = {
    user_id: req.body.selected
  };

  let sql = "DELETE from user WHERE user_id = ?"
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


  var username = req.username;
  let sql_salt = 'SELECT * from user WHERE username = ?';
  connection.query(sql_salt, data, (err, results) => {
    if (err) throw err;

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