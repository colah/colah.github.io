

var BasicVis = new function() {

  // If we disable strict, we can use some tricks to
  // give better error messages. By default, we don't
  // do this, to make finding bugs easier and to
  // comply with the style guide.

  'use strict';

  // In non-quirk browser modes, d3.selection.style("attr", int_val)
  // doesn't work! This is because it should be int_val+"px"
  // We wrap around the function to catch this case.

  var style_ = d3.selection.prototype.style;

  d3.selection.prototype.style = function(a,b) {
    if (arguments.length == 1) {
      return style_.call(this, a);
    } else if (typeof b == 'number') {
      style_.call(this, a, b + "px");
    } else {
      style_.call(this, a, b);
    }
    return this;
  };

  // Utilities!
  // =============

  // make_function
  //   A lot of arguments can be a constant
  //   or function. This turns constants into
  //   functions.

  var make_function = function(val) {
    if (typeof val == 'function') {
      return val;
    } else {
      return function() {return val;};
    }
  };

  // VisElement
  //   This is a super class for all
  //   our visualization elements

  this.VisElement = function() {

    this.updateTimeout = null;

    this.layout = function() {};
    this.render = function() {};

    this.update = function() {
      this.layout();
      this.render();
    };

    this.scheduleUpdate = function(n) {
      var this_ = this;
      n = n || 10;
      var update = function() {
        this_.layout();
        this_.render();
        this_.updateTimeout = null;
      };
      if (this.updateTimeout) clearTimeout(this.updateTimeout);
      this.updateTimeout = setTimeout(update, n);
    };

    this.bindToWindowResize = function() {
      var this_ = this;
      var scheduleUpdate = function() {
        this_.scheduleUpdate();
      };
      $(window).resize(scheduleUpdate);
    };

    // make_selector
    //   We'll use this in all our constructors
    //   to get a d3 selection to build at.

    this.make_selector = function(s) {
      var caller = '';
      //var caller = arguments.callee.caller.name;
      if (!d3) throw Error(caller + '(): Depends on the D3 library,' +
                            ' which does not seem to be in scope.');
      if (typeof s == 'string') {
        var str = s;
        s = d3.select(s);
        if (s.empty()) throw Error(caller + '(): selector \'' + str +
                          '\' doesn\'t seem to correspond to an element.');
        return s;
      } else if (typeof s == 'object') {
        if ('node' in s) {
          // s seems to be a d3 selector
          return s;
        } else if ('jquery' in s) {
          // s seems to be a jquery object
          throw TypeError(caller + '(): selector can\'t be a JQuery object;' +
                                   ' please use a string or d3.select().');
        }
      }
      throw TypeError(caller + '(): Given selector of type ' + typeof s +
             ' is not a valid selector; please use a string or d3.select().');
    };

  };

  this.VisElement.prototype = new Object();



  // Container
  //=========================



  this.Container = function Container(s) {
    this.s = this.make_selector(s);
    this.inner = this.s.append('div');
    this._children = [];
    this._children_divs = [];
    return this;
  };

  this.Container.prototype = new this.VisElement();

  this.Container.prototype.new_child = function(constructor) {
    var child_div = this.inner.append('div');
    child_div.pos = function pos(v) {
      child_div
        .style('left', v[0])
        .style('top', v[1]);
      return child_div;
    };
    child_div.size = function size(v) {
      child_div
        .style('width', v[0])
        .style('height', v[1]);
      return child_div;
    };
    var child = new constructor(child_div);
    child.div = child_div;
    this._children_divs.push(child_div);
    this._children.push(child);
    this.scheduleUpdate();
    return child;
  };


  this.Container.prototype.layout = function layout() {
    var W = parseInt(this.s.style('width'));
    this.inner
      .style('width', 1.0 * W)
      .style('position', 'relative');
    if (!this.child_layout)
      throw Error('Container: Must implement child_layout()' +
                  ' to position and size child divs.');
    for (var i = 0; i < this._children.length; i++) {
      this._children_divs[i]
        .style('position', 'absolute');
    }
    this.child_layout();
    for (var i = 0; i < this._children.length; i++) {
      this._children[i].layout();
    }
    return this;
  };

  this.Container.prototype.render = function render() {
    for (var i = 0; i < this._children.length; i++) {
      this._children[i].render();
    }
    return this;
  };

  // Equation
  //====================


  this.Equation = function Equation(s) {

    if (typeof MathJax === 'undefined')
      throw Error('Equation(): Equation depends on the MathJax library,' +
                  ' which does not seem to be in scope.');

    this.s = this.make_selector(s);
    this.inner = this.s.append('div');
    this._text = '';

    // Create empty MathJax Equation:
    // Create an empty <script type='math/tex'></script>
    // Then tell MathJax to look for it when it has time.
    // (In case page is already loaded when we're constructed.)
    this.inner.append('script')
           .attr('type', 'math/tex')
           .text('');
    MathJax.Hub.Queue(['Process', MathJax.Hub, this.inner.node()]);

    return this;
  };

  this.Equation.prototype = new this.VisElement();

  this.Equation.prototype.layout = function layout() {return this;};

  this.Equation.prototype.render = function render() {
    var node = this.inner.node();
    var eq = MathJax.Hub.getAllJax(node);
    // MathJax might not be done rendering!
    // Has it made our ElementJax yet?
    if (!eq.length) {
      // No? Let's try again later.
      this.scheduleUpdate(100);
    } else {
      // We schedule updating an equation wiht MathJax.
      MathJax.Hub.Queue(['Text', eq[0], this._text]);
    }
    return this;
  };

  this.Equation.prototype.latex = function(val) {
    if (!arguments.length) return this._text;
    this._text = val;
    this.scheduleUpdate();
    return this;
  };

  //ImgDisplay
  //================================================================

  this.ImgDisplay = function ImgDisplay(s) {
    this.s = this.make_selector(s);
    this.canvas = this.s.append('canvas');
    this._data = {};
    this._data.shape = null;
    this._data.imgs = null;
  };

  this.ImgDisplay.prototype = new this.VisElement();

  this.ImgDisplay.prototype.layout = function layout() {
    var W = parseInt(this.s.style('width'));
    this.canvas
      .attr('style', 'image-rendering:-moz-crisp-edges;' +
                     'image-rendering: -o-crisp-edges;' +
                     'image-rendering:-webkit-optimize-contrast;' +
                     '-ms-interpolation-mode:nearest-neighbor;' +
                     'image-rendering: pixelated;')
      .style('border', '1px solid #000000')
      .style('width', 1.0 * W)
      .style('height', 1.0 * W);
    return this;
  };

  this.ImgDisplay.prototype.render = function() {return this;};

  this.ImgDisplay.prototype.show = function(i) {

    var i = parseInt(i);
    var imgs = this._data.imgs;
    var shape = this._data.shape;

    if (shape.length == 2) {
      var X = shape[0];
      var Y = shape[1];
    } else if (shape.length == 3) {
      var X = shape[1];
      var Y = shape[2];
    }

    var ctx = this.canvas[0][0].getContext('2d');
    var img = ctx.getImageData(0, 0, X, Y);
    var imgData = img.data;

    if (!this._data.imgs || !this._data.shape) {
      throw Error('ImgDisplay.show(): Must set ImgDisplay.imgs() ' +
                  'and ImgDisplay.shape() before showing image.');
    }

    var imgSize = 1;
    for (var n = 0; n < shape.length; n++) {
      imgSize *= shape[n];
    }

    if (imgs.length < imgSize * (i + 1)) {
      throw Error('ImgDisplay.show(): Requested image ' + i +
                  ' out of bounds of ImgDisplay.imgs().');
    }

    if (shape.length == 2) {
      for (var dx = 0; dx < X; ++dx)
      for (var dy = 0; dy < Y; ++dy) {
        var pos = dx + shape[0] * dy;
        var s = 256 * (1 - imgs[imgSize * i + pos]);
        imgData[4 * pos + 0] = s;
        imgData[4 * pos + 1] = s;
        imgData[4 * pos + 2] = s;
        imgData[4 * pos + 3] = 255;
      }
    } else if (shape.length == 3) {
      for (var c  = 0; c  < 3; ++c )
      for (var dx = 0; dx < X; ++dx)
      for (var dy = 0; dy < Y; ++dy) {
        var pos = dx + shape[1] * dy;
        var s = 256 * (1 - imgs[imgSize * i + pos + shape[1]*shape[2]*c]);
        imgData[4 * pos + ((3-c+2)%3)] = s;
        imgData[4 * pos + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);

    return this;
  };

  this.ImgDisplay.prototype.imgs = function(val) {
    if (!arguments.length) return this._data.imgs;
    this._data.imgs = val;
    return this;
  };

  this.ImgDisplay.prototype.shape = function(val) {
    if (!arguments.length) return this._data.shape;
    if (val.length == 2) {
      this.canvas
        .attr('width', val[0])
        .attr('height', val[1]);
    } else {
      this.canvas
        .attr('width', val[1])
        .attr('height', val[2]);
    }
    this._data.shape = val;
    return this;
  };


  //MatrixSelector
  //================================================================


  this.MatrixSelector = function MatrixSelector(s) {
    this.s = this.make_selector(s);
    this.svg = this.s.append('svg');
    this._data = {};
    this._data.shape = null;
    this._data.value = [-1, -1];
    this._data.pixels = null;
    this.value = function(val) {
      if (!arguments.length) return this._data.value;
      this._data.value = val;
      this.value.change(val);
      this.scheduleUpdate();
      return this;
    };
    this.value.change = function() {};
  };

  this.MatrixSelector.prototype = new this.VisElement();

  this.MatrixSelector.prototype.layout = function layout() {
    var W = parseInt(this.s.style('width'));
    this.svg
      .style('border', '1px solid #000000')
      .style('width', 1.0 * W)
      .style('height', 1.0 * W);
    return this;
  };

  this.MatrixSelector.prototype.render = function() {

    var pixels = this._data.pixels;
    var shape = this._data.shape;
    if (!shape) throw Error('ImgDisplay.render():' +
          ' Set shape first with ImgDisplay.shape()');
    var value = this._data.value;
    var this_ = this;

    var selection = this.svg.selectAll('rect')
                   .data(pixels);

    var W = parseInt(this.s.style('width'));
    var H = parseInt(this.s.style('height'));

    // create new rects on svg
    selection.enter().append('rect')
      .style('fill', 'blue')
      .on('click', function(d, i) {
            this_.value(d);
         });
    // remove old ones from svg
    selection.exit().remove();
    // update/reset rects properties
    selection
        .attr('width', W / shape[0])
        .attr('height', H / shape[1])
        .attr('x', function(d, i) { return W * d[0] / shape[0]; })
        .attr('y', function(d, i) { return H * (1 - d[1] / shape[1]); })
        .classed('hover_show', function(d, i) 
                    {return d[0] != value[0] || d[1] != value[1];});

    return this;

  };

  this.MatrixSelector.prototype.shape = function(val) {
    if (!arguments.length) return this._data.shape;
    if (!val[0] || !val[1])
      throw Error('shape(): shape must be an array of length 2 or 3.' +
                ' For example, [28, 28] or [32, 32, 3]');
    this._data.shape = val;
    this._data.pixels = [];
    for (var i = 0; i < val[0]; i++) {
      for (var j = 0; j < val[1] + 1; j++) {
        this._data.pixels.push([i, j]);
      }
    }
    return this;
  };



  // ScatterPlot
  // ============================


  this.ScatterPlot = function ScatterPlot(s) {
    this.s = this.make_selector(s);
    this.svg = this.s.append('svg');
    this.zoom_g = this.svg.append('g');

    this._data = {};
    this._data.N = 0;
    this._data.scale = 1;
    this._data.color = function() {return 'rgb(50,50,50)';};
    this._data.x = function() {return 0;};
    this._data.y = function() {return 0;};
    this._data.size = function() {return 0;};
    this._data.mouseover = function() {};

    this._data.xrange = null;
    this._data.yrange = null;

    this.xmap = d3.scale.linear();
    this.ymap = d3.scale.linear();

    var this_ = this;

    this.zoom = d3.behavior.zoom()
                  .on("zoom", function() {this_._zoomed();});

    this.xrange.fit = function(data) {
      var x1 = d3.min(data);
      var x2 = d3.max(data);
      var dx = x2 - x1;
      this_.xrange([x1-0.02*dx, x2+0.02*dx]);
      return this_;
    };

    this.yrange.fit = function(data) {
      var x1 = d3.min(data);
      var x2 = d3.max(data);
      var dx = x2 - x1;
      this_.yrange([x1-0.02*dx, x2+0.02*dx]);
      return this_;
    };


  };

  this.ScatterPlot.prototype = new this.VisElement();

  this.ScatterPlot.prototype.layout = function layout() {
    var W = parseInt(this.s.style('width'));
    this.svg
      .style('width', W)
      .style('height', W);
    var H = parseInt(this.s.style('height'));
    var D = Math.min(W, H) / 2 - 2;
    this.xmap.range([W / 2 - D, W / 2 + D]);
    this.ymap.range([H / 2 - D, H / 2 + D]);
    return this;
  };


  this.ScatterPlot.prototype.render = function() {
    var data = this._data;
    var this_ = this;
    var selection = this.zoom_g.selectAll('circle')
                   .data(d3.range(data.N));
    this.points = selection;


      var W = parseInt(this.svg.style('width'));
      var H = parseInt(this.svg.style('height'));
      var D = Math.min(W, H) / 2 - 2;


    // create new circles on svg
    selection.enter().append('circle')
      .attr('r', 0)
      .classed({'highlight' : true})
      .on('mouseover', this._data.mouseover);
    var size = data.size()/Math.pow(data.scale, 0.7);
    // remove old circles from svg
    selection.exit().remove();
    // update/reset circle properties
    selection.transition().duration(200)
      .attr('cx', function(d, i) { return this_.xmap(data.x(i)); })
      .attr('cy', function(d, i) { return this_.ymap(data.y(i)); });
    selection
      .attr('r', size)
      .attr('fill', data.color);

    return this;

  };

  this.ScatterPlot.prototype.N = function(val) {
    if (!arguments.length) return this._data.N;
    this._data.N = val;
    this.scheduleUpdate();
    return this;
  };

  this.ScatterPlot.prototype.color = function(val) {
    if (!arguments.length) return this._data.color;
    this._data.color = make_function(val);
    this.scheduleUpdate();
    return this;
  };

  this.ScatterPlot.prototype.size = function(val) {
    if (!arguments.length) return this._data.size;
    this._data.size = make_function(val);
    this.scheduleUpdate();
    return this;
  };

  this.ScatterPlot.prototype.x = function(val) {
    if (!arguments.length) return this._data.x;
    this._data.x = make_function(val);
    this.scheduleUpdate();
    return this;
  };

  this.ScatterPlot.prototype.y = function(val) {
    if (!arguments.length) return this._data.y;
    this._data.y = make_function(val);
    this.scheduleUpdate();
    return this;
  };

  this.ScatterPlot.prototype.xrange = function(val) {
    if (!arguments.length) return this._data.xrange;
    if (!(val.length == 2)) {
      if (val.length > 5)
        throw Error('xrange(): yrange must be an array of length 2.' +
                    ' For example, [-1, 1]. Did you mean to use xrange.fit()?');
      throw Error('xrange(): yrange must be an array of length 2.' +
                 ' For example, [-1, 1].');
    }
    this._data.xrange = val;
    this.xmap.domain(val);
    this.scheduleUpdate();
    return this;
  };

  this.ScatterPlot.prototype.yrange = function(val) {
    if (!arguments.length) return this._data.yrange;
    if (!(val.length == 2)) {
      if (val.length > 5)
        throw Error('yrange(): yrange must be an array of length 2.' +
                  ' For example, [-1, 1]. Did you mean to use yrange.fit()?');
      throw Error('yrange(): yrange must be an array of length 2.' +
                  ' For example, [-1, 1].');
    }
    this._data.yrange = val;
    this.ymap.domain(val);
    this.scheduleUpdate();
    return this;
  };

  this.ScatterPlot.prototype.mouseover = function(val) {
    if (!arguments.length) return this._data.mouseover;
    this._data.mouseover = val;
    this.scheduleUpdate();
    return this;
  };

  this.ScatterPlot.prototype.enable_zoom = function() {
    this.svg.call(this.zoom);
    return this;
  };

  this.ScatterPlot.prototype._zoomed = function() {
    this.zoom_g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale +")");
    this._data.scale = d3.event.scale;
    this.scheduleUpdate();
  };


  // Overlap
  // =========================

  this.Overlap = function Overlap(s) {
    this.s = this.make_selector(s);
    this.inner = this.s.append('div');
    this._children = [];
    this._children_divs = [];
    return this;
  };

  this.Overlap.prototype = new this.VisElement();

  this.Overlap.prototype.layout = function layout() {
    var W = parseInt(this.s.style('width'));
    this.inner
      .style('width', 1.0 * W)
      .style('height', 1.0 * W)
      .classed('overlap_inner', true)
      .style('position', 'relative');
    for (var i = 0; i < this._children_divs.length; i++) {
      this._children_divs[i]
        .style('position', 'absolute')
        .style('width', 1.0 * W)
        .style('height', 1.0 * W)
        .style('top', 0)
        .style('left', 0);
    }
    for (var i = 0; i < this._children.length; i++) {
      this._children[i].layout();
    }
    return this;
  };

  this.Overlap.prototype.render = function render() {
    for (var i = 0; i < this._children.length; i++) {
      this._children[i].render();
    }
    return this;
  };

  this.Overlap.prototype.new_child = function(constructor) {
    var child_div = this.inner.append('div');
    var child = new constructor(child_div);
    this._children_divs.push(child_div);
    this._children.push(child);
    this.scheduleUpdate();
    return child;
  };


  // ToolTip
  // ========================================

  this.Tooltip = function Tooltip() {
    this.div = d3.select('body').append('div')
      .style("position", "absolute");
    this.hide();
    this.timeout = null;
    var this_ = this;
    this.div.on("mouseover", function() {
      var pos = [d3.event.pageX + 10, d3.event.pageY + 10 ];
      this_.move(pos);
    });
    return this;
  };

  this.Tooltip.prototype = new Object();

  this.Tooltip.prototype.size = function(val) {
    if (!arguments.length) return this.div.style("width");
    this.div.style("width", val);
    return this;
  };

  this.Tooltip.prototype.move = function(val) {
    this.div
      .style("left", val[0])
      .style("top", val[1]);
    return this;
  };

  this.Tooltip.prototype.unhide = function() {
    this.div
      .style("visibility", "visible")
      .style("z-index", "10");
    //throw Error("just debugging");
    return this;
  };

  this.Tooltip.prototype.hide = function() {
    this.div.style("visibility", "hidden");
    return this;
  };

  this.Tooltip.prototype.bind = function(s, cond) {
    var this_ = this;
    var timeout = null;
    var show = function(i) {
      if (cond && ! cond(i) ) {
        return;
      }
      clearTimeout(timeout);
      this_.timeout = null;
      var pos = [d3.event.pageX + 10, d3.event.pageY + 10 ];
      this_.move(pos);
      this_.display(i);
      this_.unhide();
    };
    s.on("mouseover", show);
    s.on("mousemove", show);
    s.on("mouseout", function(i) {
      if (!this_.timeout)
        this_.timeout = setTimeout(function() {this_.hide(); this_.timeout = null;}, 300);
    });
  };

  this.Tooltip.prototype.bind_move = function(s) {
    var this_ = this;
    s.on("mousemove",  function() { 
      var pos = [d3.event.pageX + 10, d3.event.pageY + 10 ];
      this_.move(pos);
    });
  };

  // ImgTooltip
  //=========================================

  this.ImgTooltip = function ImgTooltip() {
    BasicVis.Tooltip.call(this);
    this.div;
    //  .style("border", "1px solid black");
    this.img_display = new BasicVis.ImgDisplay(this.div);
    this.size("40px");
    return this;
  };

  this.ImgTooltip.prototype = Object.create(this.Tooltip.prototype);

  this.ImgTooltip.prototype.size = function size(val) {
    if (!arguments.length) return this.div.style("width");
    this.div.style("width", val);
    this.img_display.scheduleUpdate();
    return this;
  };


  this.ImgTooltip.prototype.display = function display(i) {
    this.img_display.show(i);
    return this;
  };

  // TextTooltip
  //=========================================

  this.TextTooltip = function TextTooltip() {
    BasicVis.Tooltip.call(this);
    this._labels = [];
    this.div
      .style("background-color", "white")
      .style("font-size", "130%")
      .style("padding-left", "2px")
      .style("padding-right", "2px")
      .style("padding-top", "1px")
      .style("padding-bottom", "1px")
      .style("border", "1px solid black");
    return this;
  };

  this.TextTooltip.prototype = Object.create(this.Tooltip.prototype);

  this.TextTooltip.prototype.display = function display(i) {
    var labels = this._labels;
    if (i < labels.length){
      this.div.text(labels[i]);
    } else {
      this.div.text("");
    }
    return this;
  };

  // GraphPlot3
  // ==================================

  this.GraphPlot3 = function(s, init_z_pos) {
    this.s = this.make_selector(s);
    this.inner1 = this.s.append("div");
    this.inner2 = this.inner1.append("div");
    var inner_dom = this.inner2[0][0];

    this.points = [];
    this.lines = [];

    this.mouse = new THREE.Vector2(-1, -1);
    this.INTERSECTED = null;

    this.point_event_funcs = {}

    //ThreeJS stuff
    this.camera = new THREE.PerspectiveCamera(60, 1.0/1.0, 0.01, 8000);
    this.camera.position.set(init_z_pos || 400, 0, 0);
    this.controls = new THREE.TrackballControls(this.camera, inner_dom);
    this.scene = new THREE.Scene();
    this.projector = new THREE.Projector();
    this.raycaster = new THREE.Raycaster();
    this.renderer = new THREE.WebGLRenderer();

    inner_dom.appendChild(this.renderer.domElement);

    this.make_materials();

    var this_ = this;
    this.inner1.on("mousemove", function() {
      var W = parseInt(this_.s.style('width'));
      var H = parseInt(this_.s.style('height'));
      var X = d3.event.offsetX || d3.event.layerX || 0;
      var Y = d3.event.offsetY || d3.event.layerY || 0;
	    this_.mouse.x =  2*X/W - 1;
	    this_.mouse.y = -2*Y/H + 1;
    });

    /*this.points.on = function on(event_name, f) {
      this_.point_event_funcs[event_name] = f;
    };*/

  }

  this.GraphPlot3.prototype = new this.VisElement();

  this.GraphPlot3.prototype.make_materials = function() {

    this.materials = { points: {}, selected_points: {}, lines: {} };

    this.point_classes = [];

    var material = new THREE.MeshLambertMaterial( { color:  0x777777 } );
    this.materials.points["default"] = material;

    var material = new THREE.MeshLambertMaterial( { color:  0x999999 } );
    this.materials.selected_points["default"] = material;

    var material = new THREE.LineBasicMaterial( { color: 0x555555, linewidth: 1.8 } );
    this.materials.lines["default"] = material;

	  for (var i = 0; i < 10; i++) {
      var color = d3.hsl(360*i/10.0,0.5,0.5).toString();
      var material = new THREE.MeshLambertMaterial({ color: color });
      this.materials.points[i] = material;

      var color = d3.hsl(360*i/10.0,0.8,0.8).toString();
      var material = new THREE.MeshLambertMaterial({ color: color });
      this.materials.selected_points[i] = material;

      var color = d3.hsl(360*i/10.0,0.4,0.4).toString();
      var material = new THREE.LineBasicMaterial({ color: color, linewidth: 1.8 });
      this.materials.lines[i] = material;

    }
  }

  this.GraphPlot3.prototype.layout = function layout() {
    var W = parseInt(this.s.style('width'));
    var H = parseInt(this.s.style('height'));
    H = W*0.6;
    this.s.style('height', H);
    this.camera.aspect = W/H;
    this.camera.updateProjectionMatrix();
    this.renderer.setClearColor('#FFFFFF');
    this.renderer.setSize(W, H);
    this.renderer.sortObjects = false;
    this.controls.handleResize();
    this.camera.position.z = 70;
    this._render();

    var light = new THREE.DirectionalLight( 0xffffff, 2 );
    light.position.set( 80, 0, 0 ).normalize();
    this.scene.add( light );

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0, 0 ).normalize();
    this.scene.add( light );

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( -60, 40, 0 ).normalize();
    this.scene.add( light );

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( -40, -40, 50 ).normalize();
    this.scene.add( light );

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( -40, 0, -50 ).normalize();
    this.scene.add( light );

  };



  this.GraphPlot3.prototype.make_points = function make_points(n) {
	  var geometry = new THREE.SphereGeometry( 3, 15, 15 );
	  for ( var i = 0; i < n; i ++ ) {
      var k = this.point_classes[i];
      k = k != undefined ? k : "default";
		  var object = new THREE.Mesh( geometry, this.materials.points[k] );
      object.i = i;
      object.normal_material = this.materials.points[k];
      object.selected_material = this.materials.selected_points[k];
		  this.scene.add( object );
      this.points.push(object);
	  }
  };

  this.GraphPlot3.prototype.make_edges = function make_edges(edges) {
    for (var n in edges) {
      var edge = edges[n];
      var i = edge[0], j = edge[1];
      var yi = this.point_classes[i];
      var yj = this.point_classes[j];

      yi = yi != undefined ? yi : "default";
      yj = yj != undefined ? yj : "default";

      var material_ind = (yi == yj) ? yi : "default";
      var material = this.materials.lines[material_ind];

      var geometry = new THREE.Geometry();
      geometry.dynamic = true;
      geometry.vertices.push(new THREE.Vector3(0,0,0));
      geometry.vertices.push(new THREE.Vector3(0,0,0));

      var line = new THREE.Line(geometry, material);
      line.i = i; line.j = j;
      line.is_point = false;
		  this.scene.add(line);
      this.lines.push(line);
    }
  };

  this.GraphPlot3.prototype._animate = function _animate() {
    this.controls.update();
    var this_ = this;
    requestAnimationFrame(function(){this_._animate();});
    this._render();
  };

  this.GraphPlot3.prototype._render = function _render() {

	  var mouse3 = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
    var cam_pos = this.camera.position;
	  this.projector.unprojectVector(mouse3, this.camera);
    this.raycaster.set(cam_pos, mouse3.sub(cam_pos).normalize());
    var intersects = this.raycaster.intersectObjects(this.points);

    var new_intersected = (intersects.length > 0) ? 
                            intersects[0].object : null;

    if (this.INTERSECTED != new_intersected) {
      if (this.INTERSECTED != null){
        if (this.point_event_funcs["mouseout"])
          this.point_event_funcs["mouseout"](this.INTERSECTED.i)
        this.INTERSECTED.material = this.INTERSECTED.normal_material;
      }
      this.INTERSECTED = new_intersected;
      if (this.INTERSECTED != null) {
        if (this.point_event_funcs["mouseover"])
          this.point_event_funcs["mouseover"](this.INTERSECTED.i)
        this.INTERSECTED.material = this.INTERSECTED.selected_material;
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  this.GraphPlot3.prototype.position = function position(pos) {
    var K = 7;
    for (var n = 0; n < this.points.length; n++) {
      this.points[n].position.x = pos[3*n  ]*K;
      this.points[n].position.y = pos[3*n+1]*K;
      this.points[n].position.z = pos[3*n+2]*K;
    }
    for (var n = 0; n < this.lines.length; n++) {
      var line = this.lines[n];
      var i = line.i, j = line.j;
      line.geometry.vertices[0].set(K*pos[3*i], K*pos[3*i+1], K*pos[3*i+2]);
      line.geometry.vertices[1].set(K*pos[3*j], K*pos[3*j+1], K*pos[3*j+2]);
      line.geometry.verticesNeedUpdate = true;
    }
  };


};



