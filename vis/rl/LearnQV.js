discount = 0.9;


function learn_template(R_func, V_is_Q_max) {
  return function learning_step(histories, config){
    var name = config.name || "default";
    if (histories.length == 0) return;
    var default_QV = config.init_QV || 0;
    _.times(config.steps || 1, () => {
      for (var n in histories){
        var history = histories[n];
        var R = 0;
        for (var i = history.length-1; i >= 0; i--) {
          var step = history[i];
          if (i==history.length-1) {
            var defined = step.s2.V[name] != undefined;
            step.s2.V[name] = defined? step.s2.V[name] : default_QV;
            //step.s2.actions[0].Q[name] = defined?
            //    step.s2.actions[0].Q[name]  : default_QV;
          }
          var defined = step.s.V[name] != undefined;
          step.s.V[name] = defined? step.s.V[name] : default_QV;
          var defined = step.a.Q[name] != undefined;
          step.a.Q[name] = defined? step.a.Q[name] : default_QV;
          R = R_func(R, discount, step, name);
          step.a.Q[name] += 0.05*(R - step.a.Q[name]);
          if (V_is_Q_max) {
            var qs = step.s.actions.map(a => a.Q[name]);
            step.s.V[name] = reduce_max(qs, 0);
          } else {
            step.s.V[name] += 0.05*(R - step.s.V[name]);
          }
        }
      }
    });
  }
}

learn_MC = learn_template(
  (R, y, step) => step.r + y*R,
  false
)

learn_TD = learn_template(
  (R, y, step, name) => step.r + y*step.s2.V[name],
  false
)

learn_Q = learn_template(
  (R, y, step, name) => {
    var qs = step.s2.actions.map(a => a.Q[name]);
    var V = reduce_max(qs, 0);
    return step.r + y*V;
  }, true
)


infer_DP = function infer_DP(env, P_name, name, config) {
  config = config || {};
  env.states.forEach(s => {
    s.V[name] = 0;
  });
  _.times(config.steps || 100, () => {
    env.states.forEach(s => {
      s.V[name+"-temp"] = 0;
      s.actions.forEach(a => {
        a.Q[name+"-temp"] = 0;
        a.results.forEach(x => {
          var r = x[1].goal? x[1].goal.reward : 0;
          a.Q[name+"-temp"] += r + discount*x[0]*x[1].V[name];
        })
        s.V[name+"-temp"] += a.P[P_name]*a.Q[name+"-temp"];
        if ("goal" in s) s.V[name+"-temp"] = 0;
      });
    });
    env.states.forEach(s => {
      s.V[name] = s.V[name+"-temp"];
      s.actions.forEach(a => {
        a.Q[name] = a.Q[name+"-temp"];
      });
    });
  });
}


function normalize_policy_probs(s, name){
  var sum = 0;
  s.actions.forEach(a => {
    sum += a.P[name];
  });
  s.actions.forEach(a => {
    a.P[name] /= sum;
  });
}


function learn_reinforce(histories, config){
  var name = config.name || "default";
  var K = config.K || 0.1;
  if (histories.length == 0) return;
  histories[0][0].s.env.states.forEach(s =>
    s.actions.forEach(a => {
      a.temp = a.P[name]
    }))
  for (var n in histories){
    var history = histories[n];
    var R = 0;
    for (var i = history.length-1; i >= 0; i--) {
      var step = history[i];
      R = step.r + discount*R;
      step.a.P[name] += K*R/step.a.temp;
      normalize_policy_probs(step.s, name);
    }
  }
}


function learn_reinforce_bad(histories, config){
  var name = config.name || "default";
  if (histories.length == 0) return
  // init policy?
  _.times(config.steps || 1, () => {
    for (var n in histories){
      var history = histories[n];
      var R = 0;
      for (var i = history.length-1; i >= 0; i--) {
        var step = history[i];
        R = step.r + discount*R;
        var K = 0.01;
        step.a.P[name] += K*R;
        // regularization
        step.s.actions.forEach(a => {
          a.P[name] += K*0.01/a.P[name];
        })
        normalize_policy_probs(step.s, name);
      }
    }
  });
}
