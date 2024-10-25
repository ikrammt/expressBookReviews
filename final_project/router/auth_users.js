const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ 
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }
  if (authenticatedUser(username, password)) {
      const accessToken = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });
      
      req.session.authorization = {
          accessToken,
          username
      };
      return res.status(200).json({ message: "User successfully logged in", accessToken });
  } else {
      return res.status(401).json({ message: "Invalid login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    const review = req.body.review;

    if (review) {
      book.reviews = review;
      res.status(200).send("Book review added/updated.");
    } else {
      res.status(400).json({ message: "Review content is missing" });
    }
  } else {
    res.status(404).json({ message: "Unable to find book!" });
  }
});



// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    delete book.reviews;
    res.status(200).send("Book review deleted.");
  } else {
    res.status(404).json({ message: "Unable to find book or review!" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
