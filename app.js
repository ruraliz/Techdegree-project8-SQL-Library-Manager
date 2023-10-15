var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { sequelize } = require('./models/index');

var indexRouter = require('./routes/index');
var booksRouter = require('./routes/books');

(async () => {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
      console.log("Database connection successful")
    } catch (error) {
      console.log("Error connecting to the database: ", error)
    }
  })();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/books', booksRouter);

// error handle
app.use(function(req, res, next) {
    res.status(404).render('books/page-not-found');
});

app.use(function(err, req, res, next) {
    if (err.status === 404) {
      res.status(404).render('books/page-not-found', {err});
    } else {
      err.message = err.message || 'Something went wrong on the server';
      res.status(err.status || 500).render('books/error', {err});
    }
  });

module.exports = app;
