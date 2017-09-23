//JS for news scraper
$(document).ready(function () {

//Initial page load
loadSavedPage();

function loadSavedPage() {

    $("#scrapedData").empty();
    $.get("/articles/true").then(function (data) {
            console.log(data)
            if (data && data.length > 0) {

                $.each(data, function (index, article) {
                    var artList = "<div class='card card-default'>";
                    artList += "<div class='card-header'>";
                    artList += "<h3><a class='article-link' target='_blank' href='" + article.link + "'>" + article.title + "</a>";
                    artList += "<div class='linkBlock'>";
                    artList += "<a data-id='" + article._id + "' class='btn btn-danger  delete-article'>Delete Article</a>";
                    artList += "<a data-id='" + article._id + "' class='btn btn-primary  note-article'>Notes</a>";
                    artList += "</div>";                    
                    artList += "</h3>";
                    artList += "</div>";
                    artList += "<div class='card-body'>";
                    artList += "<p class='card-text'>" + article.summary + "</p>";
                    artList += "</div>";
                    artList += "</div>";

                    $("#scrapedData").append(artList);
                });
            } else {
                console.log("no data found")
                $("#scrapedData").html("No saved articles to display.  Scrape and Save some!");
            }


    }); //end of savedArticles on click
};
// *********CHANGE THIS TO DELETE OR NOTES
$(document).on("click", ".delete-article", function() {

    var articleId = $(this).attr("data-id");
    console.log("delete code " + articleId)
    $.ajax({
        method: "DELETE",
        url: "/articles/" + articleId
    })
        .then(function () {
            loadSavedPage();
        })
        .fail(function() {
            console.log("Delete ajax call failed");
        })
});

function handleErr(err) {
    console.log("error " + err.responseJSON);
    // $("#alert .msg").text(err.responseJSON);
    // $("#alert").fadeIn(500);
}
});  //End of document ready