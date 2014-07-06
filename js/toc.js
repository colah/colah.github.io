$(document).ready(function() {
	var ToC =
		"<nav role='navigation' class='toc'>" +
    	"<ul>";

	var el, title, link;

	$("#body h2").each(function() {

  		el = $(this);
  		title = el.text();
  		link = "#" + el.attr("id");

  		newLine =
		    "<li>" +
		      "<a href='" + link + "'>" +
		        title +
		      "</a>" +
		    "</li>";

  		ToC += newLine;

	});

	ToC +=
   		"</ul>" +
  		"</nav>";

  	$(ToC).insertafter("#toc-wrapper");
});