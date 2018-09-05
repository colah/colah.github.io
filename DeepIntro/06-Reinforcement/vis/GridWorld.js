var GridWorld = {};



GridWorld.Env = function Env(config) {
  var config = config || {};
  var grid_size = config.grid_size || 4;
  var goals = config.goals || [{x: 0, y: 0, reward: 1}];
  var noise = config.noise || 0;

  var states = [];
  this.states = states;
  _.range(grid_size).forEach( y =>
    _.range(grid_size ).forEach(x => {
      var name = "s-" + x + "-" + y;
      var actions = [ {name: "up",    x:  0,  y: -1,  Q: {}, P: {} },
                      {name: "down",  x:  0,  y:  1,  Q: {}, P: {} },
                      {name: "left",  x: -1,  y:  0,  Q: {}, P: {} },
                      {name: "right", x:  1,  y:  0,  Q: {}, P: {} }, ];
      actions = _.filter(actions, a => 0 <= x + a.x && x + a.x < grid_size );
      actions = _.filter(actions, a => 0 <= y + a.y && y + a.y < grid_size );
      var state = {name: name, x: x, y: y, actions: actions, V: {}, env: this };
      var goal = _.findWhere(goals, {x: x, y: y});
      if (goal != undefined) state.goal = goal;
      states.push(state);
    }));

  states.forEach(s => s.actions.forEach(a => {
    var result = _.findWhere(states, {x: s.x + a.x, y: s.y + a.y});
    if (noise > 0) {
      var neighbors = states.filter(s_ =>
           (s_.x == s.x + 1 || s_.x == s.x - 1) && s_.y == s.y
        || (s_.y == s.y + 1 || s_.y == s.y - 1) && s_.x == s.x );
      a.results = neighbors.map(n => [noise/neighbors.length, n]);
      _.find(a.results, r => _.isEqual(r[1], result))[0] += 1 - noise;
    } else {
      a.results = [[1, result]];
    }
  }));


  var views = [];

  this.View = function View(s) {
    views.push(this);

    var width = s.attr("width"), height = s.attr("height");
    var env = s.append("g").attr("class", "env");
    var grid = env.append("g").attr("class", "grid");
    this.agent_layer = env.append("g").attr("class", "agent_layer");
    goal_layer = env.append("g").attr("class", "goal_layer");
    this.env = env;

    var S = d3.scale.linear()
      .domain([0, grid_size])
      .range([0, Math.min(width, height)]);
    this.S = S;
    var C = d3.scale.linear()
      .domain([-1, 0, 1])
      .range([ "#f50000", "#CCC", "#0000f5"]);
    this.C = C;
    this.goal_color = r => d3.rgb(C(r)).darker();
    var Cp = d3.scale.linear()
      .domain([0, 1])
      .range(["#eef", "#001"]);
    this.Cp = Cp;

    var gutter = S(0.05);

    env.attr("transform", "translate(" + S(0.5) + "," + S(0.5) + ")");

    self.cells = grid.selectAll(".cell")
      .data(_.reject(states, s => _.has(s,"goal")));
    var cells_enter = self.cells.enter().append("g")
      .attr("class", s => "cell " + s.name)
      .attr("transform", d =>
        "translate(" + S(d.x) + "," + S(d.y) + ")" );
    cells_enter.append("rect")
        .attr("width", S(1) - gutter)
        .attr("height", S(1) - gutter)
        .attr("transform", d => {
          var offset = S(-0.5) + gutter/2;
          return "translate(" + offset + "," + offset + ")";
        });

    goal_layer.selectAll("rect").data(goals).enter()
      .append("rect")
      .attr("width", S(0.8))
      .attr("height", S(0.8))
      .attr("transform", d => {
        return "translate(" + S(d.x-0.5+0.1) + "," + S(d.y-0.5+0.1) + ")";
      })
      .style("fill", d => this.goal_color(d.reward));

    cells_enter.append("g").attr("class", "V");
    cells_enter.append("g").attr("class", "Q");
    cells_enter.append("g").attr("class", "P");

    var info = {};
    info["V"] = cells.selectAll(".V")
      .data(s => [s.V]);
    info["V"]
      .append("circle")
        .attr("r", S(0.3));

    ["Q", "P"].forEach(cls => {
      info[cls] = cells.select("."+cls)
        .selectAll(".action")
        .data(s => s.actions);
      info[cls]
        .enter().append("path")
        .attr("class", a => "action " + a.name)
        .attr("d", a => triangle_path(a.name, S))
        .attr("transform", a =>
            "translate(" + S(0.25)*a.x + "," + S(0.25)*a.y + ")");
    })

    this.info = info;
    _.values(info).forEach(s => s.style("display", "none"));

    this.show_info = function show_info(info_type, name) {
      _.keys(info).filter(k => k != info_type).forEach(cls =>{
        info[cls].style("display", "none")}
      );
      if (info_type == "V") {
        info["V"]
          .style("fill", d => C(d[name]))
          .style("display", d =>
            d[name] == undefined? "none" : "");
      }
      if (info_type == "Q") {
        info["Q"]
          .style("fill", a => C(a.Q[name]))
          .style("display", a =>
            a.Q[name] == undefined? "none" : "")
      }
      if (info_type == "P") {
        info["P"]
          .style("fill", a => Cp(a.P[name]))
          .style("display", a =>
            a.P[name] == undefined? "none" : "")
      }
    }

  }


  function random_agent_position(){
    var x = randInt(grid_size), y = randInt(grid_size);
    if (_.findWhere(goals, {x: x, y:y})) {
      return random_agent_position();
    }
    return {x :x, y: y};
  }

  this.Agent = function Agent(config) {
    config = config || {};
    var start = config.start || random_agent_position();
    this.history = [];
    this.state = _.findWhere(states, start);
    this.done = false;

    var trail_history = [[start.x, start.y]];
    if (config.trail){
      this.trails = views.map(v =>
        v.env.select(".agent_layer")
          .append("path")
          .attr("class", "trail")
          .attr("stroke", "#333")
          .attr("stroke-width", v.S(0.7))
          .attr("fill", "none")
          .attr("d", "")
          .style("opacity", 0.3)
        );
    } else {
      this.trails = [];
    }

    this.agents = views.map(v =>
      v.env.select(".agent_layer")
        .append("circle")
        .attr("r", v.S(0.3))
        .attr("cx", v.S(start.x))
        .attr("cy", v.S(start.y))
      );

    this.step = function step(a, T, T2) {
      T = T || 500;
      if (this.done) return Promise.resolve({done: true});
      var s = this.state;
      var s2 = weightedRandSelect(a.results);
      this.done = _.has(s2, "goal")
      this.agents.forEach((agent, i) => {
        var v = views[i];
        agent.transition(500000)
          .attr("cx",  v.S(s2.x))
          .attr("cy",  v.S(s2.y))
          .filter(() => this.done)
            .remove();

      });
      this.trails.forEach((trail, i) => {
        var v = views[i];
        var line = d3.svg.line().x(d => v.S(d[0])).y(d => v.S(d[1]));
        var trail_history_ = trail_history.slice(0);
        trail.transition().duration(T)
          .attrTween("d", () => t => {
            var last = _.last(trail_history_);
            var mid = [t*s2.x + (1-t)*last[0], t*s2.y + (1-t)*last[1]];
            return roundPathCorners(line(trail_history.concat([mid])), 0.2, true);
          });
      });
      trail_history = trail_history.concat([[s2.x, s2.y]])
      this.state = s2;
      if (this.done){
        this.history.push({s: s, a: a, s2: s2, r: s2.goal.reward});
        var ret = {s: s2, r: s2.goal.reward, done: true}
      } else {
        this.history.push({s: s, a: a, s2: s2, r: 0});
        var ret = {s: s2, r: 0, done: false}
      }
      return new Promise(resolve =>
        setTimeout(() => resolve(ret), T2 || 1.5*T));
    }
  };

}



function triangle_path(name, S) {
  var line = d3.svg.line().x(d => S(d[0])).y(d => S(d[1]));
  var s = 0.2;
  var f = 0.1;
  if (name == "down")  ps = [[-s, 0], [0,  f], [s, 0]];
  if (name == "up")    ps = [[-s, 0], [0, -f], [s, 0]];
  if (name == "left")  ps = [[0, -s], [-f, 0], [0, s]];
  if (name == "right") ps = [[0, -s], [f,  0], [0, s]];
  return line(ps);
}
