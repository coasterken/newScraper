//JS for news scraper
$(document).ready(function () {

  //Initial page load
  loadHomePage();

  // load home page articles
  function loadHomePage() {

    $("#scrapedData").empty();
    $.get("/articles/false").then(function (data) {
      // console.log(data)
      if (data && data.length > 0) {

        $.each(data, function (index, article) {
          var artList = "<div class='card card-default'>";
          artList += "<div class='card-header article-header'>";
          artList += "<h3><a class='article-link' target='_blank' href='" + article.link + "'>" + article.title + "</a>";
          artList += "<a data-id='" + article._id + "' class='btn btn-primary save-article'>Save Article</a>";
          artList += "</h3>";
          artList += "</div>";
          artList += "<div class='card-body'>";
          artList += "<p class='card-text'>" + article.summary + "</p>";
          artList += "</div>";
          artList += "</div>";

          $("#scrapedData").append(artList);
        });
      } else {
        // console.log("no data found")
        $("#scrapedData").html("<h3>No articles to display.  Scrape some!</h3>");
      }
    });
  };

  // trigger to scrape
  $("#scrapedArticles").on("click", function () {

    $.get("/scrape").then(function (data) {

      loadHomePage();
      bootbox.alert("<h3 class='text-center m-top-80'>" + data + "<h3>");
    });

  }); //end of scrapedArticles on click

  // save an article
  $(document).on("click", ".save-article", function () {

    var articleId = $(this).attr("data-id");
    $.post("/saveArticle/" + articleId).then(function (data) {
      loadHomePage();
    });

  }); // end of save-article

}); //End of document ready