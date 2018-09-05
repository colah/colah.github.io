function reinforce_vis(main_div, config) {

var grid_size = 5;
var env = new GridWorld.Env({grid_size: grid_size, goals: [{x: 4, y: 2, reward: 1}]});
var svg = main_div.append("svg").attr("width", 400).attr("height", 320);
var S = _.range(1).map(n =>
  svg.append("g").attr("width", 300).attr("height", 300));

var V = S.map(s => new env.View(s));

create_random_policy(env, "reinforce");

discount = 0.5;
function run_episode() {
  var T = T || 100;
  var agent = new env.Agent();
  return whileP(() => !agent.done, () => {
    var a = sample_policy(agent.state, "reinforce");
    //randSelect(agent.state.actions);
    var stepP = agent.step(a, T);
    return stepP;
  }).then(() => agent.history);
}

function run() {
  V[0].show_info("P", "reinforce");
  var n = 0;
  whileP(() => true, () =>
    run_episode().then(H => {
      n += 1;
      learn_reinforce([H], {name: "reinforce", K : 0.1*Math.pow(0.98, n)});
      V[0].show_info("P", "reinforce");
    })
  );
}

main_div.append("button")
 .text("run")
 .on('click', run);

}
