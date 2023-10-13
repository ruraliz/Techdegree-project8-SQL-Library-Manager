var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

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

/* GET books listing. */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll({ order: [["createdAt", "DESC"]] });
  // console.log( books.map(book => book.toJSON()) );
  res.render("books/index", { books, title: "Sequelize-It!" });
}));

/* Create a new book form. */
router.get('/new', (req, res) => {
  res.render("books/new-book", { book, title: "" });
});

/* POST create book. */
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books" + book.id);
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("books/new-book", { book, errors: error.errors, title: "New book" })
    } else {
      throw error;
    }  
  }
}));

/* Edit book form. */
// router.get("books/:id/edit", asyncHandler(async(req, res) => {
//   const book = await Book.findByPk(req.params.id);
//   if(book) {
//     res.render("books/edit", { book, title: "Edit book" });      
//   } else {
//     res.sendStatus(404);
//   }
// }));

/* show book detail form */
router.get("/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("books/update-book", { book, title: book.title });  
  } else {
    res.sendStatus(404);
  }
})); 

/* Update an article. */
router.post('/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/books" + book.id); 
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

/* Delete book form. */
// router.get("books/:id/delete", asyncHandler(async (req, res) => {
//   const book = await Book.findByPk(req.params.id);
//   if(book) {
//     res.render("books/delete", { book, title: "Delete book" });
//   } else {
//     res.sendStatus(404);
//   }
// }));

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
