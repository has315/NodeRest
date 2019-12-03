var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var connection = require('./db');
var usersRouter = require('./routes/users');
var usersRouter = require('./routes/voters');
var port = 3000;

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
  console.log('In');
  res.locals.connection = connection
  console.log('out');
  next();
});


app.use('/users', usersRouter);
app.use('/voters', usersRouter);

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



app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});


module.exports = app;