const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql');

// parse application/json
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

//use connection 
app.use(function (req, res, next) {
	global.connection = mysql.createConnection({
		host: 'localhost',
		user: 'pgraf_glas',
		password: 'Fnligvu5abca@',
		database: 'PgrafDB'
	});
	connection.connect((err) => {
		if (err) throw err;
		console.log('Mysql Connected...');
	});;
	next();
});


//create database connection
// const conn = mysql.createConnection({
//   host: 'localhost',
//   user: 'pgraf_glas',
//   password: 'Fnligvu5abca@',
//   database: 'PgrafDB'
// });

//connect to database


//show all products
// app.get('/api/user', (req, res) => {
// 	let sql = "SELECT * FROM user";
// 	let query = conn.query(sql, (err, results) => {
// 		if (err) throw err;
// 		res.send(JSON.stringify({
// 			"status": 200,
// 			"error": null,
// 			"response": results
// 		}));
// 	});
// });
//  
// //show single product
// app.get('/api/products/:id',(req, res) => {
//   let sql = "SELECT * FROM product WHERE product_id="+req.params.id;
//   let query = conn.query(sql, (err, results) => {
//     if(err) throw err;
//     res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
//   });
// });
//  
//add new user
// app.post('/api/user', (req, res) => {
// 	let data = {
// 		username: req.body.username,
// 		password: req.body.password
// 	};
// 	let sql = "INSERT INTO user SET ?";
// 	let query = conn.query(sql, data, (err, results) => {
// 		if (err) throw err;
// 		res.send(JSON.stringify({
// 			"status": 200,
// 			"error": null,
// 			"response": results
// 		}));
// 	});
// });
//  
// //update user
// app.put('/api/user/:id', (req, res) => {
// 	let sql = "UPDATE user SET username='" + req.body.username + "', password='" + req.body.password + "' WHERE user=" + req.params.user_id;
// 	let query = conn.query(sql, (err, results) => {
// 		if (err) throw err;
// 		res.send(JSON.stringify({
// 			"status": 200,
// 			"error": null,
// 			"response": results
// 		}));
// 	});
// });

//Delete user
// app.delete('/api/user/:id', (req, res) => {
// 	let sql = "DELETE FROM user WHERE user_id=" + req.params.user_id + "";
// 	let query = conn.query(sql, (err, results) => {
// 		if (err) throw err;
// 		res.send(JSON.stringify({
// 			"status": 200,
// 			"error": null,
// 			"response": results
// 		}));
// 	});
// });



//Server listening
app.listen(3000, () => {
	console.log('Server started on port 3000...');
});