var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { sequelize } = require('./models/index');

//routes
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

// global error handler
app.use((req, res, next) => {
    const error = new Error('Page Not Found')
    error.status = 404;
    res.status(404)
    res.render('books/page-not-found', { error } );
  });
  
  app.use((err, req, res, next) => {
      err.status = err.status || 500
      err.message = err.message || 'Internal Server Error';
      res.status(err.status)
      res.render('books/error', { error: err  })
  });

module.exports = app;
