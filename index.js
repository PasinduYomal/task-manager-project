require("dotenv").config();
//import mongoose from 'mongoose';

const express = require("express");
const mongoose = require("mongoose");

//database
const database = require("./database/database");

//model
const BookModel = require("./database/book");
const AuthorModel = require("./database/author");
const PublicationModel = require("./database/publication");

//Initialization
const booky = express();

//COfiguration
booky.use(express.json());

//establish database connection
mongoose.connect(process.env.MONGO_URL ,
{

}
).then(() => console.log("Connection established"));


//get API all books
booky.get("/", async (req, res) => {
    const getAllBooks =  await BookModel.find();
    return res.json({getAllBooks});
});



//API FOR ISBN
booky.get("/is/:isbn", async(req, res) => {

    const getSpecificBook = await BookModel.findOne({ISBN: req.params.isbn});

    //null -> false

    if(!getSpecificBook){
        return res.json({
            error : `No book found for the ISBN of ${req.params.isbn}`,
    });
    }
    return res.json({book: getSpecificBook});
});

//API FOR CATEGORY
booky.get("/c/:category",async (req, res) => {

    const getSpecificBooks = await BookModel.findOne({
        category:req.params.category,
     });
    
     if(!getSpecificBooks){
        return res.json({
            error : `No book found for the category of ${req.params.category}`,
    });
    }
    return res.json({book: getSpecificBooks});
});

//API FOR LANGUAGE
booky.get("/l/:language", (req, res) => {
    const getSpecificBook = database.books.filter((book) => book.language === req.params.language
     );
     if(getSpecificBook.length === 0){
        return res.json({
            error : `No book found for the category of ${req.params.language}`,
    });
    }
    return res.json({book: getSpecificBook});
});

//API FOR AUTHOR
booky.get("/author", async(req, res) => {
    const getAllAuthors =await AuthorModel.find();
    return res.json({ authors: getAllAuthors});
});

//API BASE ON AUTHOR ID
booky.get("/author/:id", (req, res) => {
    const getSpecificAuthor = database.author.filter(
        (author) => author.id === req.params.id
    );
    if(getSpecificAuthor.length === 0){
        return res.json({
            error : `No author found for the Id of ${req.params.id}`,
    });
    }
    return res.json({author: getSpecificAuthor});
});

//APL AUTHOR BASED ON BOOK
booky.get("/author/book/:isbn", (req, res) => {
    const getSpecificAuthor = database.author.filter((author) =>
        author.books.includes(req.params.isbn)
    );
    if(getSpecificAuthor.length === 0){
        return res.json({
            error : `No Author found for the book of ${req.params.isbn}`,
        });
    }
    return res.json({ authors: getSpecificAuthor});
});

booky.get("/publications", (req, res) => {
    return res.json({ publications: database.publication });
});

//API POST METHOD add new book 
booky.post("/book/new", async(req, res) =>{
    const { newBook } = req.body;
   
    BookModel.create(newBook);
    return res.json({ books: addNewBook, message: "Book was Added" });
});


//ADD NEW API AUTHOR
booky.post("/author/new",async (req, res) =>{
    const { newAuthor } = req.body;
    AuthorModel.create(newAuthor);
    return res.json({ message: "Author was Added"  });
});

//API PUT METHOD
booky.put("/book/update/:isbn", async(req,res) => {

    const updatedBook = await BookModel.findOneAndUpdate({
        ISBN: req.params.isbn,
        },
        {
            title:req.body.bookTitle,
        },
        {
            new: true,
        }
    );

    return res.json({books: updatedBook});
});

booky.put("/book/author/update/:isbn",async (req,res) => {
   //update book database

   const updatedBook = await BookModel.findOneAndUpdate({
       ISBN:req.params.isbn,
    },
    {
        $addToSet:{
            authors: req.body.newAuthor,
        },
    },
    {
        new: true,
    }
    );

    //database.books.forEach((book) =>{
    //    if(book.ISBN === req.params.isbn)
    //        return book.authors.push(req.body.authorId);
    //});

   //update the author database
   const updatedAuthor = await AuthorModel.findOneAndUpdate({
       id: req.body.newAuthor,
    },
    {
        $addToSet:{
            books: req.params.isbn,
        },
    },{
        new:true,
    }
    );

   //database.authors.forEach((author) =>{
    //if(author.id === req.body.newAuthor)
    //    return author.books.push(req.params.isbn);
    //});
return res.json({
    books: updatedBook,
     authors: updatedAuthor,
    message:"new author was added",
});
});

//API update book in Publication
booky.put("/publication/update/book/:isbn", (req,res) =>{
    //update the publication database
    database.publications.forEach((publication) =>{
        if(publications.id === req.body.pubId){
            return publication.book.push(req.params.isbn);
        }
    });

//update the book database
database.books.forEach((book) => {
    if(book.ISBN === req.params.isbn){
        book.publications = req.body.pubId;
        return;
    }
});
return res.json({books: database.books, publications:database.publications,
message: "Successfully update publication"})
});

//API BOOK DELETE
booky.delete("/book/delete/:isbn", async(req, res)=> {

    const updatedBookDatabase = await BookModel.findOneAndDelete({
        ISBN: req.params.isbn,
    });


    //const updatedBookDatabase = database.books.filter((book) => book.ISBN !== req.params.isbn
    //);
    //database.books =updatedBookDatabase;
    return res.json({ books: updatedBookDatabase});
});

//API DELETE AUTHOR
booky.delete("/book/delete/author/:isbn/:authorId",async (req, res)=> {
    const updatedBook = await BookModel.findOneAndUpdate({
        ISBN: req.params.isbn,
    },
    {
        $pull:{
            authors:parseInt(req.params.authorId),
        },
    },
    {
        new:true,
    }
    );
    //update the author database
    const updatedAuthor = await AuthorModel.findOneAndUpdate({
        id:parseInt(req.params.authorId),
    },
    {
        $pull:{
            books:req.params.isbn,
        },
    },{
        new:true,
    });
    return res.json({book: updatedBook,
         author:updatedAuthor,
         message:"author was deleted"});
});

 //API DELETE PUBLICATION
 booky.delete("/publication/delete/book/:isbn/:pubId", (req, res)=> {
    database.publications.forEach((publication) =>{
        if(publication.id == paraseInt(req.params.pubId)){
            const newBookList =publication.books.filter((book)=>
            book !== req.params.isbn
            );
            publications.books = newBookList;
            return;
        }

    });
    database.books.forEach((book) => {
        if(book.ISBN === req.params.isbn){
            book.publication =0;
            return
        }
    });
    return res.json({books: database.books, publications:database.publications})
 });

booky.listen(3000, () => console.log("Hey server us running !"));

//talk to mongodb
