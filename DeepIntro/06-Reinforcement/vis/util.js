function mapP(l, f) {
  if (l.length == 0) return Promise.resolve([]);
  return f(l[0]).then(y =>
    mapP(l.slice(1), f).then(ys => [y].concat(ys) ));
}

function whileP(cond, f) {
  if (!cond()) return Promise.resolve([]);
  return f().then( () => whileP(cond, f) );
}

function randInt(n) {
  return Math.floor(n*Math.random());
}

function randSelect(l) {
  return l[randInt(l.length)];
}

function weightedRandSelect(l) {
  var p = Math.random();
  var ret;
  l.forEach(x => {
    if (0 < p && p <= x[0]) ret = x[1];
    p -= x[0];
  });
  if (ret == undefined) debugger;
  return ret;
}

function repeat(n, l) {
  if (n <= 0) return [];
  return l.concat(repeat(n-1, l));
}

function pairList(l) {
  return _.zip(l.slice(0,-1), l.slice(1));
}

function reduce_max(l, b) {
  if (b == undefined){
    var V = l[0];
  } else {
    var V = b;
  }
  for (var i = 0; i < l.length; i++){
    if (l[i] != undefined)
      V = Math.max(V, l[i]);
  }
  return V;
}

function reduce_sum(l) {
  var S = 0;
  for (var i = 0; i < l.length; i++){
    if (l[i] != undefined)
      S = S + l[i];
  }
  return S;
}

function reduce_mean(l) {
  return reduce_sum(l) / l.length;
}

function reduce_argmax(l) {
  var M = l[0];
  var I = 0;
  for (var i = 0; i < l.length; i++){
    if (l[i] > M){
      M = l[i];
      I = i;
    }
  }
  return I;
}

function shuffle(l){
  return l.slice().sort(() => Math.random() - 0.5);
}



Equation = function Equation(s) {

  if (typeof MathJax === 'undefined')
    throw Error('Equation(): Equation depends on the MathJax library,' +
                ' which does not seem to be in scope.');

  this.s = s;
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

this.Equation.prototype.scheduleUpdate = function(n) {
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








function prod(l) {
  return l.concat([1]).reduce( (a,b) => a*b);
}



/*

var M = {}

M.zeros = function zeros(shape) {
  if (_.isArray(shape)){
    var size = prod(shape);
    var arr = new Float32Array(_.range(size));
    arr.shape = shape;
    return arr;
  } else if (_.isNumber(shape)) {
    return zeros([shape]);
  } else {
    return zeros([]);
  }
}

M.randn = function randn(shape) {
  return M.zeros(shape).map(() => 2*Math.random()-1);
}


M.align_shapes = function align_shapes(a_shape, b_shape) {
  var aL = a_shape.length;
  var bL = b_shape.length;
  if (aL < bL) {
    var [b_shape2, a_shape2, r_shape] = align_shapes(b_shape, a_shape);
    return [b_shape2, a_shape2, r_shape]
  }
  if (!_isEqual(a_shape.slice(aL-bL), b_shape.slice(bL-aL))){
    raise("Can't align shapes " + a_shape + " and " + b_shape);
  }

  var start = a_shape.slice(0, aL-bL).concat(b_shape.slice(0, bL-aL));
  return start.concat(a_shape.slice(aL-bL));

}

M.add = function(a, b, out) {
  if (a.shape.length == 0 && b.shape.length == 0) {}
}*/

function randn(shape) {
  if (_.isEqual(shape, [])){
    return math.add(-1, math.multiply(2, math.random()))
  }
  return math.add(-1, math.multiply(2, math.random(shape)))
}
