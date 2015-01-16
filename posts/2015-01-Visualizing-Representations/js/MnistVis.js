var ImgPixelSelector = function(s) {
  shape = [28,28];
  this.s = s;
  this.overlap = new BasicVis.Overlap(s);
  this.img_display = this.overlap.new_child(BasicVis.ImgDisplay)
      .imgs(mnist_xs)
      .shape(shape)
      .show(6);
  this.pixel_selector = this.overlap.new_child(BasicVis.MatrixSelector)
      .shape(shape);
  this.layout = function() {this.overlap.layout();}
  this.update = function() {this.overlap.update();}
}

ImgPixelSelector.prototype = new BasicVis.VisElement();


var BasisPlotMNIST = function(s) {
  shape = [28,28];
  this.s = s;
  var b0 = null, b1 = null;
  this.scatter = new BasicVis.ScatterPlot(s)
    .N(500)
    .xrange([0,1])
    .yrange([0,1])
    .size(4)
    .color(function(i){return d3.hsl(360*mnist_ys[i]/10.0,0.5,0.5);});

  this.scatter.svg.style('border', '1px solid #000000');

  proj = function(i, v){
    var offset = v[0] + 28*(28-v[1]);
    var s = mnist_xs[784*i + offset];
    var k = 10 + (3*v[0] + 5*v[1]) % 11;
    if (s == 0) s += 0.02*(i%k)/k+0.01;
    if (s == 1) s -= 0.02*(i%k)/k+0.01;
    return s;
  }

  proj2 = function(n, v){
    var s = 0;
    for (var i = 0; i < 784; i++) {
      s += v[i]*mnist_xs[784*n + i];
    }
    return s;
  }

  this.b0 = function(v) {
    if (!arguments.length) return b0;
    b0 = v;
    if (v.length == 2) {
      this.scatter
        .x(function (i) {return proj(i,v);});
    } else if (v.length == 784) {
      this.scatter
        .x(function (i) {return proj2(i,v);});
    }      
    return this;
  }

  this.b1 = function(v) {
    if (!arguments.length) return b1;
    b1 = v;
    if (v.length == 2) {
      this.scatter
        .y(function (i) {return 1-proj(i,v);});
    } else if (v.length == 784) {
      this.scatter
        .y(function (i) {return 1-proj2(i,v);});
    }    
    return this;
  }

  this.layout = function() {this.scatter.layout();}
  this.render = function() {this.scatter.render();}

}

BasisPlotMNIST.prototype = new BasicVis.VisElement();

//===============================================

var RawExploreMNIST = function RawExploreMNIST(s) {

  BasicVis.Container.call(this, s);

  this.plot = this.new_child( BasisPlotMNIST );
  this.x    = this.new_child( ImgPixelSelector );
  this.y    = this.new_child( ImgPixelSelector );

  this.axxDiv = this.inner.append('div');
  this.axyDiv = this.inner.append('div');

  try {
    // Fails if MathJax isn't loaded.
    this.eqx  = this.new_child( BasicVis.Equation );
    this.eqy  = this.new_child( BasicVis.Equation );
  }
  catch(err) {
    // Not much we can do to recover; let's just try to avoid breaking the rest of the page
    // by continuing rendering.
  }

  var this_ = this;

  this.plot.scatter.mouseover(function(i) { this_.x.img_display.show(i); this_.y.img_display.show(i);});

  platex = function(v) { return 'p_{' + v[0] + ',' + (v[1]-1) +'}';};
  this.x.pixel_selector.value.change = function(v) {this_.plot.b0(v); this_.eqx.latex(platex(v)); };
  this.y.pixel_selector.value.change = function(v) {this_.plot.b1(v); this_.eqy.latex(platex(v)); };

};

RawExploreMNIST.prototype = Object.create(BasicVis.Container.prototype);

RawExploreMNIST.prototype.child_layout = function child_layout() {


  W = parseInt(this.s.style('width'));

  var plot   = W/2;
  var side   = W/4;
  var pick   = 2/3*side;
  var gutter = (side-pick)/2;

  this.inner
      .style('width',  W)
      .style('height', plot+side);

  this.plot.div
      .pos([side, 0])
      .size([plot, plot]);

  this.y.div
      .pos([gutter, gutter])
      .size([pick, pick]);

  this.x.div
      .pos([plot + gutter, plot + gutter])
      .size([pick, pick]);

  this.axyDiv
      .attr('style', 'background: -moz-linear-gradient(right, white, black); background: linear-gradient(to right, white , black);')
      .style('border', '1px solid #000000')
      .style('position', 'absolute')
      .style('top',  plot+1)
      .style('left', side)
      .style('width',  plot)
      .style('height', gutter/3);

  this.axxDiv
      .attr('style', 'background: -moz-linear-gradient(top, white, black); background: linear-gradient(to top, white , black);')
      .style('border', '1px solid #000000')
      .style('position', 'absolute')
      .style('top',  0)
      .style('left', side - gutter/3 -1)
      .style('width',  gutter/3)
      .style('height', plot);

  this.eqy.div
      .style('top', plot - W/4/3 )
      .style('left', side - W/4/3 - 20 );

  this.eqx.div
      .style('top',  plot + W/4/3 - 10)
      .style('left', side + W/4/3);

  return this;
}


var PlotReducedMNIST = function PlotReducedMNIST(s) {

  BasicVis.Container.call(this, s);

  var shape = [28, 28];

  this.scatter = this.new_child(BasicVis.ScatterPlot)
    .N(500)
    .xrange.fit(mnist_sne)
    .yrange.fit(mnist_sne)
    .x(function(i) {return mnist_sne[2*i   + 20*500];})
    .y(function(i) {return mnist_sne[2*i+1 + 20*500];})
    .size(4)
    .color(function(i){return d3.hsl(360*mnist_ys[i]/10.0,0.5,0.5);});
  this.img_display = this.new_child(BasicVis.ImgDisplay)
      .imgs(mnist_xs)
      .shape(shape);

  var this_ = this;

  this.scatter.mouseover(function(i) { this_.img_display.show(i); });

};

PlotReducedMNIST.prototype = Object.create(BasicVis.Container.prototype);

PlotReducedMNIST.prototype.child_layout = function child_layout() {

  W = parseInt(this.s.style('width'));

  var plot    = W/2;
  var side    = W/4;
  var display = 3/4*side;
  var gutter  = (side - display)/2;

  this.inner
      .style('width',  W)
      .style('height', plot);

  this.scatter.div
      .pos([side, 0])
      .size([plot, plot]);

  this.img_display.div
      .pos([side+plot+gutter, 0])
      .size([display, display]);

  return this;
}


// RepresentationSpacePlotMNIST
//===========================

var RepresentationSpacePlotMNIST = function RepresentationSpacePlotMNIST(s) {
  BasicVis.Container.call(this, s);
  var shape = [28,28];

  this.info = this.inner.append("div");

  this.rep_plot = this.new_child(BasicVis.ScatterPlot)
    .N(mnist_reps_rep.names.length)
    .xrange.fit(mnist_reps_rep.pca)
    .yrange.fit(mnist_reps_rep.pca)
    .x(function(i) {return mnist_reps_rep.pca[2*i  ];})
    .y(function(i) {return mnist_reps_rep.pca[2*i+1];})
    .color(function(i){
      var name = mnist_reps_rep.names[i];
      var n = 200, k = -1;
      if (name.indexOf("_net")      > -1)  {k = 0;}
      if (name.indexOf("_netR")     > -1)  {k = 1;}
      if (name.indexOf("_convnet")  > -1)  {k = 2;}
      if (name.indexOf("_netR200-") > -1)  {k = 3;}
      if (name.indexOf("_netR40-")  > -1)  {k = 3;}

      if (name.indexOf("_net1_")    > -1)  {n = 1;  }
      if (name.indexOf("_net2_")    > -1)  {n = 2;  }
      if (name.indexOf("_net5_")    > -1)  {n = 5;  }
      if (name.indexOf("_net20_")   > -1)  {n = 20; }
      if (name.indexOf("_net100_")  > -1)  {n = 100;}

      if (name.indexOf("_netR1_")   > -1)  {n = 1;  }
      if (name.indexOf("_netR2_")   > -1)  {n = 2;  }
      if (name.indexOf("_netR5_")   > -1)  {n = 5;  }
      if (name.indexOf("_netR20_")  > -1)  {n = 20; }
      if (name.indexOf("_netR100_") > -1)  {n = 100;}

      return d3.hsl(360*(k/5.0),0.4+0.7*Math.log(n-0.9)/Math.log(200),0.5);
      //return d3.hsl(360*(k/5.0 + 0.3*Math.pow(n+1,0.2)/Math.pow(200,0.2)),0.5,0.5);
    });

  this.rep_display = this.new_child(BasicVis.ScatterPlot)
    .N(0)
    .color(function(i){return d3.hsl(360*mnist_ys[i]/10.0,0.5,0.5);});

  var rep_display = this.rep_display;

  this.rep_display.show = function show(name) {
    var rep = mnist_reps[name];
    rep_display
      .N(500)
      .xrange.fit(rep)
      .yrange.fit(rep)
      .x(function(i) {return rep[2*i  ];})
      .y(function(i) {return rep[2*i+1];});
  }

  this.img_display = this.new_child(BasicVis.ImgDisplay)
      .imgs(mnist_xs)
      .shape(shape);

  var this_ = this;

  this.rep_plot.mouseover(function(i) {
      var name = mnist_reps_rep.names[i];

      var human_name = function(name){
        var n = -1, np = -1, k = -1, maxpool = false;

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

        if (n > -1 && k == 0)
          return "Sigmoid Layer (" + n + " units)";
        if (n > -1 && k == 1)
          return "ReLU Layer (" + n + " units)";
        if (n > -1 && k == 2 && maxpool)
          return "Conv Layer ("+ n +" features; 5x5 patch; max 2x2)";
        if (n > -1 && k == 2)
          return "Conv Layer ("+ n +" features; 5x5 patch)";
        if (n > -1 && k == 3)
          return "Two ReLU Layers <br>(" + np + " units; " + n + " units)";
        if (name == "mnist_raw")
          return "Raw MNIST";
        if (name.indexOf("netR[40, 20]") > -1) 
          return "Two ReLU Layers <br>(40 units; 20 units)";
        if (n == -1 || k > 1)
          return name;
      }

      this_.info.html("<center>"+ human_name(name) + "</center>");
      this_.rep_display.show(name); 
    });
  this.rep_display.mouseover(function(i) { this_.img_display.show(i); });

}

RepresentationSpacePlotMNIST.prototype = Object.create(BasicVis.Container.prototype);

RepresentationSpacePlotMNIST.prototype.child_layout = function child_layout() {

  W = parseInt(this.s.style('width'));

  var gutter   = W/20;
  var main     = W - 4*gutter;
  var R = 2/3;
  var K = 1/(R+R*R+R*R*R);
  var rep_plot = K*main*R;
  var rep_display = K*main*R*R;
  var img_display = K*main*R*R*R;

  this.inner
      .style('width',  W)
      .style('height', rep_plot);

  this.rep_plot.size(W/250);//.size(W/150);
  this.rep_plot.div
     .style('border', '1px solid #000000')
      .pos([gutter, 0])
      .size([rep_plot, rep_plot]);

  this.rep_display.size(W/300);
  this.rep_display.div
     .style('border', '1px solid #000000')
      .pos([rep_plot+2*gutter, (rep_plot-rep_display)/2])
      .size([rep_display, rep_display]);

  this.img_display.div
     .style('border', '1px solid #000000')
      .pos([rep_plot+rep_display+3*gutter, (rep_plot - img_display)/2])
      .size([img_display, img_display]);

  this.info
      .style('position', 'absolute')
      .style('font-size', '80%')
      .style('width',  rep_display)
      .style('height', (rep_plot-rep_display)/3)
      .style('left', rep_plot+2*gutter)
      .style('top', (rep_plot-rep_display)*2/3 + rep_display);

  return this;

}




// ========================================

var PlotDataMNIST = function PlotDataMNIST(s) {

  BasicVis.Container.call(this, s);

  var shape = [28, 28];
  var W = parseInt(this.s.style('width'));

  this.scatter = this.new_child(BasicVis.ScatterPlot);
  this.scatter.div.size([W*(1-3/20)*2/3, W*(1-3/20)*2/3]);
  this.scatter
    .N(0)
    .size(4)
    .color(function(i){return d3.hsl(360*mnist_ys[i]/10.0,0.5,0.5);});

  this.select = this.inner.append("select");

  var this_ = this;

  this.select.on("change", function() {
    this_.display(this.value);
  });

};

PlotDataMNIST.prototype = Object.create(BasicVis.Container.prototype);

PlotDataMNIST.prototype.data = function data(val) {
  this._data = val;
  this.select.html("");
  for (var key in this._data) {
    var inp = this.select
      .append("option")
        .attr("value", key)
        .text(key);
  }
  var key0 = Object.keys(val)[10];
  this.display(key0);
  var this_=this;
}

PlotDataMNIST.prototype.display = function display(i) {
  this.sne = this._data[i];
  var this_ = this;
  console.log(this_.sne[0], this_.sne.length);
  console.log(this);
  var a = 1.05*d3.min(this_.sne), b = 1.05*d3.max(this_.sne);
  console.log(a,b);
  this.scatter
     //.N(sne.length/2)
    .N(2000)
    .xrange([a,b])
    .yrange([a,b])
    .x(function(i) {return this_.sne[2*i  ];})
    .y(function(i) {return this_.sne[2*i+1];});
  this.scatter.update();
  //this.scheduleUpdate();
}

PlotDataMNIST.prototype.child_layout = function child_layout() {

  W = parseInt(this.s.style('width'));

  var margin  = W/20;
  var main    = W - 3*margin;
  var plot    = 2/3*main;
  var side    = 1/3*main;

  this.inner
      .style('width',  W)
      .style('height', plot);

  this.scatter.div
      .style("border", "1px solid black")
      .pos([side + 2*margin, 0])
      .size([plot, plot]);

  this.select
      .style("position", "absolute")
      .style("width", side)
      .style("left", margin)
      .style("top", 0)
      .style("height", plot)
      .attr("multiple", "multiple");

  return this;
}



  //MatrixDisplay
  //================================================================


MatrixDisplay = function MatrixDisplay(s) {
  this.s = this.make_selector(s);
  this.svg = this.s.append('svg');
  this._data = {};
  this._data.shape = null;
  this._data.pixels = null;
  this.pixel_values = [[]];
};

MatrixDisplay.prototype = new BasicVis.VisElement();

MatrixDisplay.prototype.layout = function layout() {
  var W = parseInt(this.s.style('width'));
  this.svg
    .style('border', '1px solid #000000')
    .style('width', 1.0 * W)
    .style('height', 1.0 * W);
  return this;
};

MatrixDisplay.prototype.render = function() {

  var pixels = this._data.pixels;
  var shape = this._data.shape;
  if (!shape) throw Error('ImgDisplay.render():' +
        ' Set shape first with ImgDisplay.shape()');
  var pixel_values = this.pixel_values;
  var this_ = this;

  var selection = this.svg.selectAll('rect')
                 .data(pixels);

  var W = parseInt(this.s.style('width'));
  var H = parseInt(this.s.style('height'));

  // create new rects on svg
  selection.enter().append('rect');
  // remove old ones from svg
  selection.exit().remove();
  // update/reset rects properties
  selection
      .attr('width', W / shape[0])
      .attr('height', H / shape[1])
      .attr('x', function(d, i) { return W * d[0] / shape[0]; })
      .attr('y', function(d, i) { return H * (1 - d[1] / shape[1]); })
      .style("opacity", function(d,i) { var v = pixel_values[d[0]][d[1]-1]; return 0.2+0.5*v*v;})
      .style("fill", function(d, i) { var v = pixel_values[d[0]][d[1]-1];  return d3.rgb(Math.max(70, 100 - 150*v) ,70, Math.max(70, 100 + 150*v))});
  return this;

};

MatrixDisplay.prototype.shape = function(val) {
  if (!arguments.length) return this._data.shape;
  if (!val[0] || !val[1])
    throw Error('shape(): shape must be an array of length 2 or 3.' +
              ' For example, [28, 28] or [32, 32, 3]');
  this._data.shape = val;
  this._data.pixels = [];
  this.pixel_values = [];
  for (var i = 0; i < val[0]; i++) {
    var temp = [];
    for (var j = 0; j < val[1] + 1; j++) {
      this._data.pixels.push([i, j]);
      temp.push(0.0);
    }
    this.pixel_values.push(temp);
  }
  return this;
};

// ========

var ImgPixelDisplay = function(s) {
  shape = [28,28];
  this.s = s;
  this.overlap = new BasicVis.Overlap(s);
  this.img_display = this.overlap.new_child(BasicVis.ImgDisplay)
      .imgs(mnist_xs)
      .shape(shape)
      .show(6);
  this.pixel_display = this.overlap.new_child(MatrixDisplay)
      .shape(shape);
  this.layout = function() {this.overlap.layout();}
  this.update = function() {this.overlap.update();}
}

ImgPixelDisplay.prototype = new BasicVis.VisElement();



// ===================


var DirExploreMNIST = function DirExploreMNIST(s) {

  BasicVis.Container.call(this, s);

  this.plot = this.new_child( BasisPlotMNIST );
  this.x    = this.new_child( ImgPixelDisplay );
  this.y    = this.new_child( ImgPixelDisplay );

  this.axxDiv = this.inner.append('div');
  this.axyDiv = this.inner.append('div');

  var this_ = this;

  this.plot.scatter.mouseover(function(i) { this_.x.img_display.show(i); this_.y.img_display.show(i);});

};

DirExploreMNIST.prototype = Object.create(BasicVis.Container.prototype);

DirExploreMNIST.prototype.child_layout = function child_layout() {

  W = parseInt(this.s.style('width'));

  var plot   = W/2;
  var side   = W/4;
  var pick   = 2/3*side;
  var gutter = (side-pick)/2;

  this.inner
      .style('width',  W)
      .style('height', plot+side);

  this.plot.div
      .pos([side, 0])
      .size([plot, plot]);

  this.y.div
      .pos([gutter, gutter])
      .size([pick, pick]);

  this.x.div
      .pos([plot + gutter, plot + gutter])
      .size([pick, pick]);

  this.axyDiv
      .attr('style', 'background: -moz-linear-gradient(right, red, gray, blue); background: linear-gradient(to right, red, #E3E3E3, blue);')
      .style('border', '1px solid #000000')
      .style('position', 'absolute')
      .style('top',  plot+1)
      .style('left', side)
      .style('width',  plot)
      .style('height', gutter/3);

  this.axxDiv
      .attr('style', 'background: -moz-linear-gradient(top, red, gray, blue); background: linear-gradient(to top, red, #E3E3E3, blue);')
      .style('border', '1px solid #000000')
      .style('position', 'absolute')
      .style('top',  0)
      .style('left', side - gutter/3 -1)
      .style('width',  gutter/3)
      .style('height', plot);

  return this;
}


// Graph Layout -- mostly for use with a Worker
//======

var GraphLayout = function(s, range) {
  this.sne = new Float32Array(2*1000);
  var this_ = this;

  range = range || 25;

  this.scatter = new BasicVis.ScatterPlot(s);
  this.scatter
    .N(this.sne.length/2)
    .xrange([-range, range])//.fit(sne)
    .yrange([-range, range])//.fit(sne)
    .x(function(i) {return this_.sne[2*i  ];})
    .y(function(i) {return this_.sne[2*i+1];})
    .size(4.5)
    .color(function(i){return d3.hsl(360*mnist_ys[i]/10.0,0.5,0.5);})
    .enable_zoom()
    .bindToWindowResize();
  this.scatter.s.style("border", "1px black solid");

  this.scatter.layout();
  this.s = this.scatter.s;

  this.fast_reposition = function() {
    var points = this.scatter.points[0];
    var xmap = this.scatter.xmap;
    var ymap = this.scatter.ymap;
    for (var i = 0; i < points.length; i++) {
      points[i].setAttribute("cx", xmap(this_.sne[2*i]));
      points[i].setAttribute("cy", ymap(this_.sne[2*i+1]));
    }
  };

  this.make_edges = function () {
    var edges = this.edges;
    var selection = this.scatter.zoom_g.selectAll("line").data(d3.range(edges.length/2));
    selection.enter().insert("line", ":first-child")
      .style("stroke-width", 1.25)
      .style("stroke", function(edge, n) {
        var i = edges[2*n], j = edges[2*n+1];
        if (mnist_ys[i] == mnist_ys[j]){
          return d3.hsl(360*mnist_ys[i]/10.0,0.35,0.35);
        } else {
          return d3.rgb(80, 80, 80);
        }});
    this.lines = selection[0];
  }

  this.fast_reposition_edges = function() {
    var xmap = this.scatter.xmap;
    var ymap = this.scatter.ymap;
    for (var n = 0; n < this.lines.length; n++) {
      var line = this.lines[n];
      var i = this.edges[2*n], j = this.edges[2*n+1];
      line.setAttribute("x1", xmap(this.sne[2*i  ]));
      line.setAttribute("y1", ymap(this.sne[2*i+1]));
      line.setAttribute("x2", xmap(this.sne[2*j  ]));
      line.setAttribute("y2", ymap(this.sne[2*j+1]));
    }

  };

  this.layout = function() {
    this.scatter.layout();
  };

  this.render = function() {
    this.scatter.render();
    this.make_edges();
  };

  this.rerender = function() {
    this.fast_reposition();
    this.fast_reposition_edges();
  };

};

//==================

var AnimationWrapper = function(anim) {
  this.anim = anim;
  this.s = anim.s;
  this.button = this.s.append('div');
  this.has_run = false;

  this.layout = function() {
    this.s.style('position', 'relative');
    var W = parseInt(this.s.style('width'));
    var H = parseInt(this.s.style('height'));
    this.button
      .style("border", "1px black solid")
      .style('width', 60)
      .style('height', 25 )
      .style('position', 'absolute')
      .style('left', W/40)
      .style('bottom', H/60)
      .style('border-radius', 6)
      .style("cursor", "default")
      .style("text-align", "center")
      .style("vertical-align", "middle")
      .style("background", "#DDDDDD")
      .style("z-index", 10)
      .text('play');
    var this_ = this;
    this.button.on("click", function() {this_.on_click(); });
  };

  this.run = function() {};
  this.reset = function() { this.W.postMessage({cmd: "reset"}); };

  this.hide = function() {
    this.button.style('visibility', 'hidden');
  }
  this.unhide = function() {
    this.button.style('visibility', 'visible');
  }

  this.on_click = function () {
    if (this.has_run) {
      this.reset();
      this.has_run = false;
    }
    this.hide();
    this.run();
  }
  this.on_done = function () {
    this.has_run = true;
    this.unhide();
  }

  this.bindToWorker = function(W) {
    this.W = W;
    var this_ = this;
    var obj = this.anim;
    W.onmessage = function(e) {
      data = e.data;
      switch (data.msg) {
        case "update":
          obj.sne = data.embed;
          window.requestAnimationFrame(function() { obj.rerender();});
          break;
        case "ready":
          break;
        case "edges":
          obj.edges = data.edges;
          obj.make_edges();
          window.requestAnimationFrame(function() { obj.rerender();});
        case "done":
          this_.on_done();
          break;
      }
    };
  };
    
}
