
function cliff_vis(main_div, config) {
  var config = config || {};
  var grid_size = config.grid_size || 5;
  var cliff = _.range(grid_size).map(n => ({y: n, x: grid_size-1, reward: -1}) )
  var env = new GridWorld.Env({grid_size: grid_size, goals: cliff.concat([{x: grid_size-2, y: 0, reward: 1}])});

  var svg = main_div
    .append("svg")
    .attr("width", 1200)
    .attr("height", 500);

  var steps = 4;

  var S = [];
  var labels = [];
  var sliders = [];
  _.range(2*steps).map(n => {
    var size = 170;
    var is_V = n % 2;
    var n_ = Math.floor(n/2)
    var margin = {x: 60, y: 85};
    var pos = {x: 20 + (margin.x/2+size/2)*n, y: 10 + (margin.y+size)*is_V };
    //var pos = {x: 20 + (margin.x+size)*n_, y: 10 + (margin.y+size)*is_V };
    //var pos = {x: 20 + (20+size)*n, y: 10 + (margin.y)*is_V };
    //var pos = {x: 20 + (20+2*size)*n_ + size/2*is_V, y: 10 + (size+10)*is_V };
    var label_pos = {x: pos.x+size/2+0, y: pos.y+size+37};
    //var label_pos = {x: pos.x+size/2+0, y: pos.y+size+25+20*((n+1)%2-200)};
    S.push(
      svg.append("g")
      .attr("width", size)
      .attr("height", size)
      .attr("transform", "translate("+pos.x+","+pos.y+")")
    );
    labels.push(
      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "translate("+label_pos.x+","+label_pos.y+")")
      .style("font-weight", "bold")
      .style("font-size", "80%")
    );

  });

  function make_label(pos_x, name, latex) {
    var label1 = d3.select("body").append("div")
      .style("position", "absolute")
      .style("top", "300px")
      .style("left", (30+300*pos_x) + "px")
      .style("width", "300px");
    label1.append("div")
      .text(name)
      .style("font-weight", "bold")
      .style("margin-bottom", "10px");
    //label1.append("br");
    new Equation(label1.append("div")).latex(latex);
  }

  var V = S.map(s => new env.View(s));
  V.forEach(v =>
    v.env.select(".goal_layer")
      .insert("rect", ":first-child")
      .attr("width", v.S(0.9))
      .attr("height", v.S(4.9))
      .attr("transform", "translate("+v.S(3.55)+", "+v.S(-0.45)+")" )
      .style("fill", v.goal_color(-1))
    )

  discount = 0.6;
  create_random_policy(env, "p0")
  function update(T) {
    _.range(steps).forEach(n => {
      infer_DP(env, "p"+n, "v"+n);
      var eps = 0;
      epsilon_greey_policy(env, eps, "v"+n, "p"+(n+1))
      setTimeout(() => {
        V[2*n].show_info("P", "p"+n);
        labels[2*n].text("Policy " + n);
      }, T*2*n);
      setTimeout(() => {
        V[2*n+1].show_info("V", "v"+n);
        labels[2*n+1].text("Value " + n);
      }, T*(2*n+1))
    })
  }
  update(100);

}
