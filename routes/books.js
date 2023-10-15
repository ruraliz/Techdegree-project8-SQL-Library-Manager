var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
var { Op } = require("sequelize");

let currentPage = 1;
let searchTerm;
const itemsPerPage = 10;

function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

//search function 
async function search(query) {
  if(query){
    searchTerm= query
  }else{
    searchTerm= searchTerm
  }
  return await Book.findAndCountAll({
    where: {
      [Op.or]: {
        title: {
          [Op.substring]: searchTerm,
        },
        author: {
          [Op.substring]: searchTerm,
        },
        genre: {
          [Op.substring]: searchTerm,
        },
        year: {
          [Op.substring]: searchTerm,
        },
      },
    },
    offset: (currentPage - 1) * itemsPerPage,
    limit: itemsPerPage,
  });
}
//search form
router.post("/search", asyncHandler(async (req, res) => {
    currentPage = 1;
    const books = await search(req.body.query);
    const numOfPages = Math.ceil(books.count / itemsPerPage);
    res.render("books/index", {books: books.rows, title: `${searchTerm}`, pages: numOfPages, currentPage, searchQ: true, searchTerm});
  })
);

//GET ROUTE '/search'
//Displays results from database search.


router.get("/search",asyncHandler(async (req, res) => {
    currentPage = req.query.page || currentPage;
    const books = await search();
    const numOfPages = Math.ceil(books.count / itemsPerPage);
    res.render("books/index", {books: books.rows, title: `${searchTerm}`, pages: numOfPages, currentPage, searchQ: true, searchTerm});
  })
);

router.get("/",asyncHandler(async (req, res) => {
    if(req.query.home){
     currentPage = 1
    }else{
      currentPage = req.query.page || currentPage
    }
    const books = await Book.findAndCountAll({
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
      order: [["createdAt", "DESC"]] 
    });
    const numOfPages = Math.ceil(books.count / itemsPerPage);
    if (!books.count) {
      const err = new Error(`No books exist!`);
      res.render("books/page-not-found", {
        error: err,
      });
    } else {
      res.render("books/index", { books: books.rows, title: "Library Database", pages: numOfPages, currentPage});
    }
  })
);

/* Create a new book form. */
router.get('/new', (req, res) => {
  res.render("books/new-book", { book: {} });
});

/* POST create book. */
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books");
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("books/new-book", { book: book, errors: error.errors, title: "New book" })
    } else {
      throw error;
    }  
  }
}));

/* show book detail form */
router.get("/:id", asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("books/update-book", { book, title: book.title });  
  } else {
    const err = new Error();
    err.status = 404;
    err.message = "Looks like the book you requested doesn't exist."
    next(err)
  }
})); 

/* Update an article. */
router.post('/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/books"); 
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("books/update-book", { book, errors: error.errors, title: "Edit book" })
    } else {
      throw error;
    }
  }
}));

/* Delete individual book. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    res.sendStatus(404);
  }
}));


module.exports = router;
