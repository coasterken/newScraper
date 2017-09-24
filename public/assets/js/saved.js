//JS for news scraper
$(document).ready(function () {

  //Initial page load
  loadSavedPage();

  //create the articles part of the page
  function loadSavedPage() {

    $("#scrapedData").empty();
    $.get("/articles/true").then(function (data) {
      // console.log(data)
      if (data && data.length > 0) {

        $.each(data, function (index, article) {
          var artList = "<div class='card card-default'>";
          artList += "<div class='card-header article-header'>";
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
        $("#scrapedData").html("<h3>No saved articles to display.  Scrape and Save some!</h3>");
      }


    }); //end of savedArticles on click
  };
  
  // *********Delete an article from mongo
  $(document).on("click", ".delete-article", function () {

    var articleId = $(this).attr("data-id");
    $.ajax({
        method: "DELETE",
        url: "/articles/" + articleId
      })
      .then(function () {
        loadSavedPage();
      })
      .fail(function (xhr, textStatus, errorThrown) {
        handleErr(xhr.responseText);
      });
  });

  // *********Create a notes entry box
  $(document).on("click", ".note-article", function () {

    // store id saved in data element of button
    var articleId = $(this).attr("data-id");
    // run a query to get the notes for this id
    $.get("/notes/" + articleId).then(function (data) {
      // console.log(data)
      //set up modal display
      var noteModal = "<div class='container-fluid text-center'>";
      noteModal += "<div class='card-header note-header'>";
      noteModal += "<h5>Notes for Article " + articleId + "</h5>";
      noteModal += "<hr>";
      noteModal += "<ul class='list-group notesblock'>";
      if (data.note && data.note.length > 0) {
      
        $.each(data.note, function (index, notebody) {
          noteModal += "<li class='list-group-item note'>" + notebody.body;
          noteModal += "<button data-articleid='" + articleId + "' data-noteid='" + notebody._id + "' class='btn btn-danger note-delete'>x</button>";
          noteModal += "</li>"
        }); //end of each loop

      } else {
        noteModal += "<li class='list-group-item note'>No notes for this article</li>"; 
      }
      noteModal += "</ul>";
      noteModal += "<textarea id='bodytext' placeholder='Enter a note' rows='5' cols='50'></textarea>";
      noteModal += "<button data-id='" + articleId + "' class='btn btn-primary note-save'>Save Note</button>";
      noteModal += "</div>";
      bootbox.dialog({
        message: noteModal,
        closeButton: true
      });
    }); //  end of get notes
  });

  // *********add a note
  $(document).on("click", ".note-save", function () {

    // store id saved in data element of button
    var articleId = $(this).attr("data-id");
    var noteBody = $("#bodytext").val();

    if (noteBody) {

      $.post("articles/"+ articleId, {body:noteBody})
      
        .done(function () {
          bootbox.hideAll();
        })
        .fail(function () {
          handleErr("Error in note post");
        }) // end of post
    }
  }); //end of save note action

  // *********delete a note
  $(document).on("click", ".note-delete", function () {

    // store id saved in data element of button
    var articleId = $(this).attr("data-articleid");
    var noteId = $(this).attr("data-noteid");
    var parms = {"articleid":articleId, "noteid":noteId};

    $.ajax({
      method: "DELETE",
      url: "/notes/" + JSON.stringify(parms) 
    })
      .then(function () {
        bootbox.hideAll();
      })
      .fail(function (xhr, textStatus, errorThrown) {
        handleErr(xhr.responseText);
      });

  }); //end of save note action

  function handleErr(err) {
    console.log("error " + err.responseJSON);
    // $("#alert .msg").text(err.responseJSON);
    // $("#alert").fadeIn(500);
  }
}); //End of document ready