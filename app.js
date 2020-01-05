var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var connection = require('./db');
var usersRouter = require('./routes/users');
var votersRouter = require('./routes/voters');
var cors = require('cors');
var http = require('http');
var debug = require('debug')('newproject:server');
const Browser = require('zombie');


browser = new Browser()
browser.visit("https://www.izbori.ba/Default.aspx?CategoryID=509&Lang=3", () => {
  console.log(browser.text("title"));

  let first_name = "";
  let last_name = "";
  let id = ""

  browser.fill("#Prezime", first_name);
  browser.fill("#Ime", last_name);
  browser.fill("#JMBG", id);

  browser.pressButton("#ctl04_cmdProvjeri", () => {
    console.log("Form submit ok");
    console.log()

    let label1 = browser.document.getElementsByClassName("Label1");
    let label2 = browser.document.getElementsByClassName("Label2");

    if (label1.length == label2.length) {
      // Access response data
      let result = {};
      for (let i = 0; i < label1.length; ++i)
        result[label1[i].innerHTML] = label2[i].innerHTML;

      // Print result
      for (var key in result)
        if (result.hasOwnProperty(key))
          console.log(`${key}${result[key]}`);
    }
  })
})

var port = 3000;


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  console.log('In');
  res.locals.connection = connection
  console.log('out');
  next();
});


app.use('/users', usersRouter);
app.use('/voters', votersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});


// app.listen(port, () => {
//   console.log(`Listening to requests on http://localhost:${port}`);
// });

var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  debug('Listening on ' + bind);

  module.exports = app;
}