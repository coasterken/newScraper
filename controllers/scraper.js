//controller for news scraper app

var express = require('express');
var app = express();
var request = require('request');
// Parses our HTML and helps us find elements
var cheerio = require("cheerio");

//get models for saving/retrieving data
var Note = require("../models/notes.js");
var Article = require("../models/articles.js");

//home page
app.get("/", function (req, res) {
    res.render("index");
}); 

// A GET request to scrape the echojs website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with request
    request("http://www.nytimes.com/", function (error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        // Now, we grab every h2 within an article tag, and do the following:
        var totalScrapes = 0;
        $("article").each(function (i, element) {

            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).children("h2").children("a").text();
            result.link = $(this).children("h2").children("a").attr("href");
            result.summary = $(this).children("p.summary").text();
            
            var entry = new Article(result);
            Article.findOne(function (err, data) {
                if (!data) {
                    // Now, save that entry to the db
                    entry.save(function (err, doc) {
                        // Log any errors
                        if (err) {
                            console.log(err);
                        }
                        // Or log the doc
                        else {
                            console.log(doc);
                            totalScrapes ++;
                        };
                    });
                };
            });
        });
    });
    // Tell the browser that we finished scraping the text
    if (totalScrapes === 0) {
        res.send("No New Headlines Available");
    } else {
        res.send(totalScrapes +  " articles added");        
    }
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function (req, res) {
    // TODO: Finish the route so it grabs all of the articles
    Article.find({}, function (error, doc) {
        // Send any errors to the browser
        if (error) {
            res.send(error);
        }
        // Or send the doc to the browser
        else {
            res.json(doc);
        }
    });

});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function (req, res) {

    Article.findOne({ "_id": req.params.id })
        .populate("note")
        // Now, execute that query
        .exec(function (error, doc) {
            // Send any errors to the browser
            if (error) {
                console.log(error);
            }
            // Or, send our results to the browser, which will now include the books stored in the library
            else {
                res.json(doc);
            }
        });
});

// Create a new note or replace an existing note
app.post("/articles/:id", function (req, res) {
    var articleId = req.params.id;

    var newNote = new Note(req.body);
    // Save the new note to mongoose
    newNote.save(function (error, doc) {
        // Send any errors to the browser
        if (error) {
            res.send(error);
        }
        // Otherwise
        else {
            // Find our user and push the new note id into the User's notes array
            Article.findOneAndUpdate({ "_id": articleId }, { $set: { "note": doc._id } }, { new: true }, function (err, newdoc) {
                // Send any errors to the browser
                if (err) {
                    res.send(err);
                }
                // Or send the newdoc to the browser
                else {
                    res.send(newdoc);
                }
            });
        }
    });
});


//Export routes for server.js to use
module.exports = app;