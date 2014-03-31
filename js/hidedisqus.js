$(document).ready(function() {
	$(".main-discussion-link-wrp").onclick=function(){
	  	$("#disqus_thread").toggle(function(){
	  		$(this).hide();
	  	});
	};
};