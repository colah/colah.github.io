
function create_random_policy(env, name) {
  env.states.forEach(s => {
    s.actions.forEach(a => {
      a.P[name] = 1/s.actions.length;
    })
  })
}

function epsilon_greey_policy(env, epsilon, Q_name, P_name) {
  env.states.forEach(s => {
    // Compute which actions are best according to Q
    var optimal_as = [];
    var q = -100;
    s.actions.forEach(a => {
      var aQ = a.Q[Q_name];
      var d = 0.001;
      if (aQ > q+d ) {
        q = aQ;
        optimal_as = [a];
      } else if (aQ >= q-d ) {
        optimal_as.push(a);
      }
    })
    // assign policy probabilities to actions
    s.actions.forEach(a => {
      a.P[P_name] = epsilon/s.actions.length;
    })
    optimal_as.forEach(a => {
      a.P[P_name] += (1-epsilon)/optimal_as.length;
    })
  })
}

function sample_policy(s, name) {
  var action_with_probs = s.actions.map(a =>
    [a.P[name], a]
  );
  return weightedRandSelect(action_with_probs);
}
