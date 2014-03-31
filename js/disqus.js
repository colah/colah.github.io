

var disqus_shortname = 'colah'; 
    (function() {
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = 'http://disqus.com/forums/lambdaoinks/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();

    (function () {
      var s = document.createElement('script'); s.async = true;
      s.src = 'http://disqus.com/forums/lambdaoinks/count.js';
      (document.getElementsByTagName('HEAD')[0] || document.getElementsByTagName('BODY')[0]).appendChild(s);
    }());

jQuery(document).ready(function() {
    jQuery("p:not(.footnotes ol li p)").inlineDisqussions({
      identifier: 'disqussion',
      displayCount: true,
      highlighted: false,
      position: 'right',
      background: 'white',
      maxWidth: 4000,
    });
    jQuery("img").inlineDisqussions({
      identifier: 'disqussion',
      displayCount: true,
      highlighted: false,
      position: 'right',
      background: 'white',
      maxWidth: 4000,
    });
});
