var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var helpers = require('../lib/helpers')

function Books() {
  return knex('books');
}

function Authors_Books() {
  return knex('authors_books');
}

function Authors() {
  return knex('authors');
}

router.get('/', function(req, res, next) {
  Books().then(function(books){
    Promise.all(
      books.map(function(books){
        return Authors_Books().where('book_id', books.id).pluck('author_id').then(function(authorIds){
          return Authors().whereIn('id', authorIds).then(function(authors){
            books.author = authors
            return books;
          })
        })
      })
    ).then(function(authors){
      res.render('books/index', {authors: authors})
    })
  })
});

router.get('/new', function(req, res, next) {
  res.render('books/new');
});

router.post('/', function (req, res, next) {
  var errors = [];
  if(!req.body.title.trim()){errors.push("Title cannot be blank")}
  if(!req.body.genre.trim()){errors.push("Genre cannot be blank")}
  if(!req.body.cover_url.trim()){errors.push("Cover image cannot be blank")}
  if(!req.body.description.trim()){errors.push("Description cannot be blank")}
  if(errors.length){
    res.render('books/new', { book: req.body, errors: errors })
  } else {
    Books().insert(req.body).then(function (results) {
        res.redirect('/');
    })
  }
})

router.get('/:id/delete', function(req, res, next) {
  Books().where('id', req.params.id).first().then(function (book) {
    Authors_Books().where('book_id', book.id).pluck('author_id').then(function(aId){
      Authors().where('id', aid).then(function(author){
        res.render('books/delete', {author:author, book: book})
        })
      })
    })
  })



router.post('/:id/delete', function(req, res, next) {
  Books().where('id', req.params.id).del().then(function (book) {
    res.redirect('/books');
  })
});

router.get('/:id/edit', function(req, res, next) {
  Books().where('id', req.params.id).first().then(function (book) {
    res.render('books/edit', {book: book});
  })
});

router.get('/:id', function(req, res, next) {
  return knex('authors').where('id', req.params.id).first().then(function(author){
    return knex('authors_books').where('author_id', author.id).pluck('book_id').then(function(books){
      return knex.select().from('books').whereIn('id', books).then(function(final){
        console.log(author, final);
        res.render('authors/show', {author:author, books:final})
    })
  })
})
});

router.post('/:id', function(req, res, next) {
  var errors = [];
  if(!req.body.title.trim()){errors.push("Title cannot be blank")}
  if(!req.body.genre.trim()){errors.push("Genre cannot be blank")}
  if(!req.body.cover_url.trim()){errors.push("Cover image cannot be blank")}
  if(!req.body.description.trim()){errors.push("Description cannot be blank")}
  if(errors.length){
    res.render('books/edit', { book: req.body, errors: errors })
  } else {
    Books().where('id', req.params.id).update(req.body).then(function (results) {
      res.redirect('/');
    })
  }
});

module.exports = router;
