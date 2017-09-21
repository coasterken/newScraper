//JS for news scraper
$(document).ready(function () {

$("#scrapedArticles").on("click", function() {

    $.get("/scrape", function (data) {
        $("#scrapedData").html(data);
    });

}); //end of scrapedArticles on click

});  //End of document ready