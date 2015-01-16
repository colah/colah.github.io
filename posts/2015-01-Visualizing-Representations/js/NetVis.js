
// NetworkLayout
//==================

var NetworkLayout = function NetworkLayout(s) {

  BasicVis.Container.call(this, s);

  this.svg = this.inner.append("svg");
  this.repsg = this.svg.append("g");
  this.label1g = this.svg.append("g");
  this.label2g = this.svg.append("g");
  this.rep_div_cont = this.inner.append('div');
  this.inner.style('position', 'relative');

  //this.plot = this.new_child( BasisPlotMNIST );

  this.layers = null;

};

NetworkLayout.prototype = Object.create(BasicVis.Container.prototype);

NetworkLayout.prototype.layout = function() {

};

NetworkLayout.prototype.render = function() {

  var layers = this.layers;
  if (!layers) return this;

  var edges = [];
  for (var l = 0; l < layers.length-1; l++)
  for (var i = 0; i < layers[l  ].n; i++)
  for (var j = 0; j < layers[l+1].n; j++) {
    edges.push([l, i, j]);
  }

  var points = [];
  for (var l = 0; l < layers.length; l++)
  for (var i = 0; i < layers[l  ].n; i++) {
    points.push([l, i]);
  }

  var W = parseInt(this.s.style('width'));
  this.svg.style('width', W);
  var max_width = d3.max(layers, function(l) {return l.n;}) - 1;

  var text_space = 26;
  var dot_clear = 15;
  //var bot_H = main_H*(1- max_width*max_width/(5+2*max_width*max_width));
  var rep_box = W/Math.max(4, layers.length)/1.3;
  var bot_H = rep_box*1.1;
  var top_H = W/2 * max_width*max_width/(5+2*max_width*max_width);
  var side_margin = bot_H/2;

  var main_H = bot_H + top_H+1;
  var H = main_H + 2*text_space + 4;
  this.svg.style('height', H);

  var xmap = d3.scale.linear()
    .domain([0, layers.length -1])
    .range([side_margin, W-side_margin]);
  var ymap = d3.scale.linear()
    .domain([-max_width, max_width])
    .range([dot_clear, main_H - dot_clear - bot_H]);

  var lines = this.svg.selectAll("line")
      .data(edges);
  lines.enter().append("line");
  lines
    .style("stroke-width", 2)
    .style("stroke", d3.rgb(80, 80, 80) )
    .attr("x1", function(d) { return xmap(d[0]);  } )
    .attr("y1", function(d) { return ymap(2*d[1] - layers[d[0]].n + 1);  } )
    .attr("x2", function(d) { return xmap(d[0]+1);} )
    .attr("y2", function(d) { return ymap(2*d[2] - layers[d[0]+1].n + 1);  } );

  var circles = this.svg.selectAll("circle")
      .data(points);
  circles.enter().append('circle');
  circles
    .attr("r", 4)
    .attr("cx", function(d) { return xmap(d[0]);  } )
    .attr("cy", function(d) { return ymap(2*d[1] - layers[d[0]].n + 1);  } )
    .attr('fill', d3.rgb(60, 60, 60));

  var labels1 = this.label1g.selectAll("text")
    .data(layers);
  labels1.enter().append("text");
  labels1.text(function(d) {return d.label;} );
  labels1
    .attr("x", function(d, i) { var W = parseInt(d3.select(this).style('width')); return xmap(i) - W/2; } )
    .attr("y", function(d, i) { var H = parseInt(d3.select(this).style('height')); return main_H + H + (text_space-H)/2; } );

  var labels2 = this.label2g.selectAll("text")
    .data(layers);
  labels2.enter().append("text");
  labels2.text(function(d) {return d.label2;} );
  labels2
    .attr("x", function(d, i) { var W = parseInt(d3.select(this).style('width')); return xmap(i) - W/2; } )
    .attr("y", function(d, i) { var H = parseInt(d3.select(this).style('height')); return main_H + H + text_space + (text_space-H)/2; } );

  var repsT = this.repsg.selectAll("g")
    .data(layers);
  var repsT_enter = repsT.enter().append("g");

  var reps_enter = repsT_enter.append('g')
    .style('visibility', function(d) { return d.hide_rep? 'hidden' : 'visible';});
  var reps_enter_hidden = repsT_enter.append('g')
    .style('visibility', function(d) { return d.hide_rep? 'visible' : 'hidden';});

  reps_enter.append('line')
    .attr('y1', main_H - bot_H + (bot_H - rep_box)/2)
    //.attr('y2', main_H - bot_H)
    .attr('y2', function (d,i) { return ymap(d.n-1) + dot_clear;})
    .attr('x1', function (d,i) { return xmap(i);})
    .attr('x2', function (d,i) { return xmap(i);})
    .attr('stroke-dasharray', '5,5')
    .attr('style', 'fill: none; stroke: black; stroke-width: 2;');

  reps_enter.append('rect')
    .attr('y', main_H - bot_H + (bot_H - rep_box)/2)
    .attr('x', function (d,i) { return xmap(i) - rep_box/2;})
    .attr('rx', rep_box/20)
    .attr('ry', rep_box/20)
    .attr('width', rep_box)
    .attr('height', rep_box)
    .attr('style', 'fill: none; stroke: black; stroke-width: 2.5;');

  reps_enter_hidden.append('line')
    .attr('y1', main_H)
    //.attr('y2', main_H - bot_H)
    .attr('y2', function (d,i) { return ymap(d.n-1) + dot_clear;})
    .attr('x1', function (d,i) { return xmap(i);})
    .attr('x2', function (d,i) { return xmap(i);})
    .attr('stroke-dasharray', '5,5')
    .attr('style', 'fill: none; stroke: black; stroke-width: 2;');

  var rep_div_selec = this.rep_div_cont.selectAll('div')
      .data(layers);
  rep_div_selec.enter().append('div')
        .style('position', 'absolute')
        .style('left', function (d,i) { return (xmap(i) - 0.95*rep_box/2)+"px";})
        .style('top', (main_H - bot_H + (bot_H - 0.95*rep_box)/2) + "px")
        .style('width', 0.95*rep_box)
        .style('height', 0.95*rep_box);
  this.rep_divs = [];
  for (var n = 0; n < layers.length; n++) {
    this.rep_divs.push(d3.select(rep_div_selec[0][n]));
  }
    //.attr('style', 'fill: none; stroke: black; stroke-width: 4; stroke-linecap: round;');
  
};


//=========================

function display_embed(data, div, fix_width) {
  var sne = data["vs_sne"];
  var toks = data["toks"];
  var urls = data["urls"];
  var cats = data["cats"];
  var tok_cats = data["tok_cats"];
  div = d3.select(div);

  var this_ = this;

  var W = parseInt(div.style('width'));

  if (W > 500) {
    var class_N = 6;
  } else {
    var class_N = 1;
  }

  this_.categories = [];

  var opacity = 0.2 + 0.4*Math.pow(0.01, Math.max(1, sne.length - 3000)/20000.0);
  console.log(opacity, sne.length, Math.max(1, sne.length - 3000)/20000.0);

  var scatter = new BasicVis.ScatterPlot(div.select(".sne"))
    .N(sne.length/2)
    //.enable_zoom()
    .xrange.fit(sne)
    .yrange.fit(sne)
    .x(function(i) {return sne[2*i  ];})
    .y(function(i) {return sne[2*i+1];})
    .size(2.3)
    .color(function(i){
      var k = -1;
      if (tok_cats[i]) {
        for (var catn in this_.categories) {
          if (tok_cats[i].indexOf(this_.categories[catn]) != -1) {k = catn;}
        }
      }
      if ( k == -1) { return "rgba(150,150,150," + opacity + ")"; }
      return d3.hsl(360*k/class_N,0.5,0.5);
    });
  scatter.bindToWindowResize()

  this.scatter = scatter;

  scatter.recolor = function() {
      var data = scatter._data;
      scatter.points
        .attr('fill', data.color);
    };

  scatter.update();


  this_.tooltip = new BasicVis.TextTooltip();
  this_.tooltip._labels = toks;
  this_.tooltip.bind(scatter.points);
  this_.tooltip.bind_move(scatter.s);
  this_.tooltip.div.style("font-size", "85%");
  if (fix_width) {
    this_.tooltip.div.style('width', W/2 + "px");
  }

  if (urls) {
    scatter.points.on("click", function(i){
      window.open(urls[i]);
    });
  }




  var category_div_container = function(cont) {

    function new_cat_div () {
      var n = this_.categories.length;
      var inner = $("<div>").appendTo(cont).css("margin-bottom", "10px");
      var sq = $("<div>").appendTo(inner);
      sq.css("width", "10%").css("height", "15px").css("display", "inline-block");
      sq.css("background-color", "hsl(" + 360*n/class_N + ",50%,50%)" );
      var div = $("<input>").appendTo(inner);
      div.css("display", "inline-block");
      div.css("width", "80%");
      div.css("margin-left", "5%")
      div.css("font-size", "90%");
      //$("<br>").appendTo(cont);
      category_div(div);
    }

    var category_div = function(div){

      var n = this_.categories.length;
      this_.categories.push("");

      catChange = function(e, ui){
        if (ui && ui.item && ui.item.value) {
          var s = ui.item.value || this.value;
        } else {
          var s = this.value;
        }
        if (cats.indexOf(s) == -1 && s != "") return;
        this_.categories[n] = cats.indexOf(s);
        setTimeout(function() {scatter.recolor();}, 0);
        //if (this_.categories.length == n + 1 && s != "")
        //  new_cat_div();
      }

      var getMatchList = function(req, resp) {
        var term = req.term;
        var max_matches = 14;
        if (term.length == 0) {
          var matches = cats.slice(0, max_matches);
          if (cats.length > max_matches){
            matches.push('...');
          }
        } else {
          var term_esc = term;
          var regex = new RegExp(term_esc, 'i'); //ignore case
          var matches = [];
          for (var i = 0; i < cats.length; i++) {
            if (!regex.test(cats[i]))
              continue;
            matches.push(cats[i]);
            if (matches.length >= max_matches) {
              matches.push('...');
              break;
            }
          }
        }
        resp(matches);
      }

      div.autocomplete({
        delay: 1,
        source: getMatchList,
        select: catChange,
        change: catChange
      });
      div.change(catChange);

    }

    for (var j = 0; j < class_N; j++) {
      new_cat_div();
    }

    setTimeout(function() {
      var H_main = parseInt(div.style("height"));
      var H_cont = parseInt(cont.style("height"));
      cont.style("top", (H_main-H_cont)/2 + "px")
    }, 1);

  }


  category_div_container(div.select(".legend"));
  $(".ui-autocomplete").css("font-size", "90%").css("text-align", "left");

}



//===============

var friendly_reps = {};

(function() {

    var rep_names = Object.keys(mnist_reps).sort();
    var human_name = function(name){
      var n = -1, np = -1, k = -1, i = -1, maxpool = false;

      if (name.indexOf("_N0")      > -1)  {i = 0;}
      if (name.indexOf("_N1")      > -1)  {i = 1;}
      if (name.indexOf("_N2")      > -1)  {i = 2;}
      if (name.indexOf("_N3")      > -1)  {i = 3;}
      if (name.indexOf("_N4")      > -1)  {i = 4;}

      if (name.indexOf("_net")      > -1)  {k = 0;}
      if (name.indexOf("_netR")     > -1)  {k = 1;}
      if (name.indexOf("_conv")     > -1)  {k = 2;}
      if (name.indexOf("_netR200-") > -1)  {k = 3;}
      if (name.indexOf("_netR40-")  > -1)  {k = 3;}
      if (name.indexOf("_netR10-")  > -1)  {k = 3;}

      if (name.indexOf("200-100") > -1)  {np = 200; n = 100;}
      if (name.indexOf("40-20")   > -1)  {np = 40;  n = 20;}
      if (name.indexOf("10-5")    > -1)  {np = 10;  n = 5;}


      if (name.indexOf("max2")  > -1)  {maxpool = true;}

      if      (name.indexOf("net100")  > -1)  {n = 100;}
      else if (name.indexOf("net200")  > -1)  {n = 200;}
      else if (name.indexOf("net10")   > -1)  {n = 10; }
      else if (name.indexOf("net20")   > -1)  {n = 20; }
      else if (name.indexOf("net1")    > -1)  {n = 1;  }
      else if (name.indexOf("net2")    > -1)  {n = 2;  }
      else if (name.indexOf("net5")    > -1)  {n = 5;  }
      else if (name.indexOf("net8")    > -1)  {n = 8;  }


      if (name.indexOf("_netR1_")   > -1)  {n = 1;  }
      if (name.indexOf("_netR2_")   > -1)  {n = 2;  }
      if (name.indexOf("_netR5_")   > -1)  {n = 5;  }
      if (name.indexOf("_netR10_")  > -1)  {n = 10; }
      if (name.indexOf("_netR20_")  > -1)  {n = 20; }
      if (name.indexOf("_netR100_") > -1)  {n = 100;}
      if (name.indexOf("_netR200_") > -1)  {n = 200;}

      if (i > 1)
        return null;
      if (n > -1 && k == 0)
        return "Sigmoid Layer (" + n + " units)  -  " +i;
      if (n > -1 && k == 1)
        return "ReLU Layer (" + n + " units)  -  " +i;
      if (n > -1 && k == 2 && maxpool)
        return "Conv Layer ("+ n +" features; 5x5 patch; max 2x2) -  " +i;
      if (n > -1 && k == 2)
        return "Conv Layer ("+ n +" features; 5x5 patch) -  " +i;
      if (n > -1 && k == 3)
        return "Two ReLU Layers (" + np + " units; " + n + " units) -  " +i;
      if (name == "mnist_raw")
        return "Raw MNIST";
      if (name.indexOf("netR[40,20]") > -1) 
        return "Two ReLU Layers (40 units; 20 units) -  " +i;
      if (n == -1 || k > 1)
        return name;
    }


    for (var i in rep_names){
      var name = rep_names[i];
      var name2 = human_name(name);
      if (name2)
        friendly_reps[name2] = mnist_reps[name];
    }

})();

