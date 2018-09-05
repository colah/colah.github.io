
function compare_vis(main_div, config){

config = config || {};
var grid_size = 7;
var algs = config.algs || ["MC", "TD", "Q"] ;
var env = new GridWorld.Env({grid_size: grid_size, goals: [{x: 4, y: 2, reward: 1}]});
var svg = main_div.append("svg").attr("width", 1050).attr("height", 400);

var S = _.range(algs.length).map(n =>
  svg.append("g").attr("width", 280).attr("height", 280)
    .attr("transform", "translate("+(20+350*n)+",20)"));

function make_label(pos_x, name, latex) {
  var label1 = main_div.append("div")
    .style("position", "absolute")
    .style("top", "300px")
    .style("left", (30+350*pos_x) + "px")
    .style("width", "300px")
    .style("font-size", "65%")
    .style("text-align", "left");
  label1.append("div")
    .text(name)
    .style("font-weight", "bold")
    .style("margin-bottom", "10px");
  //label1.append("br");
  new Equation(label1.append("div")).latex(latex);
}

label_data = {
   MC: {name: "Monte-Carlo", eq: "V(s_t) ~⇜~ R_t"},
   TD: {name: "Temporal Difference", eq: "V(s_t) ~⇜~ r_t + \\gamma V(s_{t+1})"},
   Q:  {name: "Q-Learning", eq: "Q(s_t, a_t) ~⇜~ r_t + \\gamma V(s_{t+1})\\\\ V(s) = \\max_a Q(s,a)"} }

setTimeout(() => {
   _.range(algs.length).map(n => {
      name_info = label_data[algs[n]];
      make_label(n, name_info.name, name_info.eq);
   });
  }, 200);

var V = S.map(s => new env.View(s));

function update(histories){
  discount = 0.82;
  learn_MC(histories, {name: "MC", steps: 100});
  learn_TD(histories, {name: "TD", steps: 500});
  learn_Q(histories, {name: "Q", steps: 500});
  _.range(algs.length).map(n => {
     V[n].show_info("V", algs[n]);
  });
}

(function visualize(){
  var agent1 = new env.Agent({start: {x: 4, y: grid_size-1}});
  action_names = repeat(grid_size-1, ["up"]);
  mapP(action_names, a_name => {
    var a = _.findWhere(agent1.state.actions, {name: a_name});
    if (agent1.history.length != 0) {
      update([agent1.history]);
    }
    var P = agent1.step(a, 300);
    return P;
  }).then(() => {
    var agent2 = new env.Agent({start: { x:0, y: grid_size-3}});
    action_names = repeat(grid_size-1, ["right"])
            .concat(repeat(grid_size-3, ["up"]))
            .concat(repeat(grid_size-1, ["left"]))
            .concat(repeat(2, ["down"]))
            .concat(repeat(grid_size-2, ["right"]));
    return mapP(action_names, a_name => {
      var a = _.findWhere(agent2.state.actions, {name: a_name});
      update([agent1.history, agent2.history]);
      var P = agent2.step(a, 300);
      return P;
    });
  }).then(() => setTimeout(() => {
    env.states.forEach(s => {
      for (var k in s.V) {s.V[k] = undefined;}
      s.actions.forEach(a => {
        for (var k in a.Q) {a.Q[k] = undefined;}
      });
    });
    update([]);
    visualize();
  }, 6500));
})()

}
