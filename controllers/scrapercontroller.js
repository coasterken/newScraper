//controller for news scraper app
var express = require('express');
var app = express();
var request = require('request');
// Parses our HTML and helps us find elements
var cheerio = require("cheerio");

//get models for saving/retrieving data
var Note = require("../models/notes.js");
var Article = require("../models/articles.js");

//  ************* ROUTES **************
//home page
app.get("/", function (req, res) {
    res.render("index");
});

//saved page
app.get("/saved", function (req, res) {
    res.render("saved");
});

// A GET request to scrape the echojs website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with request
    request("http://www.nytimes.com/", function (error, response, html) {

        Article.find({}, function (err, data) {

            var returnScrapes = processArticles(html, data);
            console.log("returned scrapes " + returnScrapes);
            if (returnScrapes === 0) {
                res.send("No New Headlines Available " + returnScrapes);
            } else {
                res.send(returnScrapes + " articles added");
            };
        });
    }); //end of request
});


// This will get the articles we scraped from the mongoDB
app.get("/articles/:saved", function (req, res) {
    // TODO: Finish the route so it grabs all of the articles
    var saved = req.params.saved;

    console.log("saved " + saved)

        Article.find({saved:saved}, function (error, doc) {
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
app.post("/saveArticle/:id", function (req, res) {

    var id = req.params.id;

    Article.findByIdAndUpdate(id, { $set: { saved: 'true' } }, { new: true }, function (err, article) {
        if (err) res.send(err);;
        res.send(article);
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
            Article.findOneAndUpdate({
                "_id": articleId
            }, {
                $set: {
                    "note": doc._id
                }
            }, {
                new: true
            }, function (err, newdoc) {
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

// This will grab an article by it's ObjectId
app.delete("/articles/:id", function (req, res) {
    console.log("server code hit " + req.params.id )
    Article.findByIdAndRemove(req.params.id, function(error, article) {
            // Send any errors to the browser
            if (error) {
                console.log(error);
            } else {
                res.json(article);
            }
        });
});

//  *********** FUNCTIONS **************
function processArticles(html, data) {

    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every article tag, and do the following:
    var totalScrapes = 0;
    $("article").each(function (i, element) {

        // Save an empty result object
        var result = {};
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this).children("h2").children("a").text();
        result.link = $(this).children("h2").children("a").attr("href");
        result.summary = $(this).children("p.summary").text();

        if (result.title && result.link && result.summary) {
            let hasTitle = data.some(article => article['title'] === result.title)

            if (!hasTitle) {
                totalScrapes++
                var entry = new Article(result);
                // Now, save that entry to the db
                entry.save(function (err, doc) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                    }
                    // Or log the doc
                    else {
                        console.log("Saved Doc " + doc);
                    };
                }); // end of article save
            }; // end of if statement
        }
    }); // end of Article.each loop
    return totalScrapes;
}


//Export routes for server.js to use
module.exports = app;