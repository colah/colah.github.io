
function TabularAproximator(default_value) {
  table = {}
  this.eval = x => {
    var fx = table[x];
    return (fx == undefined)? default_value : fx;
  }
  this.aprox = (x, y, config) => {
    config = config || {};
    var K = config.K || 0.01;
    var fx = table[x];
    fx = (fx == undefined)? default_value : fx;
    table[x] = fx + K*(y - fx);
  }
}


function NetworkAprox(layer_sizes, act_str){
  this.layers = pairList(layer_sizes).map(
    ([n1,n2]) => new FC_layer(n1, n2, act_str));
  this.eval = x => {
    var fx = x;
    this.layers.forEach(l => {
      fx = l.run().forward(fx);
    });
    return fx;
  }
  this.approx = (x, y, config) => {
    config = config || {};
    var K = config.K || 0.01;
    var fx = x;
    var runs = this.layers.map(l => l.run());
    runs.forEach(l => {
      fx = l.forward(fx);
    });
    var dy = y - fx;
    runs.reverse().forEach(l => {
      dy = l.backprop(dy);
    });
  }
}

function FC_layer(n_inputs, n_outputs, act_str) {
  act_str = act_str.toLowerCase();
  this.W = math.multiply(0.01, randn([n_outputs, n_inputs]));
  this.b = math.multiply(0.01, randn([n_outputs]));
  if (act_str == undefined){
    var act = x => x;
    var actD = x => 1;
  } else if (act_str == "tanh") {
    var act = math.tanh;
    var actD = x => math.square(math.sech(x));
  } else if (act_str == "relu") {
    var act  = x => (x < 0)? 0 : x;
    var actD = x => (x < 0)? 0 : 1;;
  }

  this.run = () => {
    run = {};
    var a = undefined;
    var x = undefined;
    run.forward = x_ => {
      x = x_;
      a = math.add(math.multiply(this.W, x), this.b);
      return a;
    }
    run.backprop = (dy, config) => {
      config = config || {};
      var K = config.K || 0.01;
      var derivs = actD(a);
      var b_ = math.dotMultiply(derivs, dy);
      var W_ = _.range(math.size(b_)).map(i =>
                _.range(math.size(x)).map(j =>
                  x[j]*b_[i]))
      var x_ = math.multiply(math.transpose(this.W), b_);
      this.b = math.add(this.b, math.multiply(K, b_));
      this.W = math.add(this.W, math.multiply(K, W_));
      return x_;
    }
    return run;
  }

}


function init_V_aprox(env, name, aprox, feature_names){
  env.states.forEach(s => {
    if (feature_names.length) {
      features = feature_names.map(n => s[n]);
    } else {
      features = s[feature_names]
    }
    s.V[name] = {eval: _.partial(aprox.eval, features),
                aprox: _.partial(aprox.aprox, features) }
  })
}
