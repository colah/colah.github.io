function tug_vis(main_div){

var data = [{prob: 0.2, val: 0.2}, {prob: 0.6, val: 0.5}, {prob: 0.2, val: 0.8}]

var svg = main_div.append("svg");
svg.style("width", '600px')
svg.style('height', '420px')
var c10 = d3.scale.category10();

var rects = svg.selectAll('rect').data(data);
rects.enter().append("rect")
  .style('fill', (d,i) => c10(i) );

function update(){
  rects
    .attr('width', d => 600*d.prob)
    .attr('height', d => 400*d.val)
    .attr('x', (d, i) => 600*reduce_sum(data.slice(0, i).map(x => x.prob)))
    .attr('y', d => 400*(1-d.val))
    .style('fill', (d,i) => c10(i) )
}
update();

var actions = [];
function reinforce_step(){
  var prob_list = data.map((d,i) => [d.prob, i]);
  var sample_i = weightedRandSelect(data.map((d,i) => [d.prob, i]));
  //var sample_i = randSelect(data.map((d,i) => i));
  actions.push(sample_i)
  rects
    .filter((d,i) => i == sample_i)
    .style('fill', (d,i) => d3.rgb(c10(i)).darker().toString() );
  var d = data[sample_i];
  var Dp = 0.02*d.val/d.prob;
  d.prob += Dp;
  data.forEach((d2,i) => {
    if (i == sample_i) return;
    d2.prob -= Dp * d2.prob / Math.max(1-d.prob, Dp);
  })
  var total_prob = reduce_sum(data.map((d,i) => d.prob));
  data.forEach(d2 => {
    d2.prob /= total_prob;
  })
  update();
  return sample_i;
}

var interval = undefined;
function run() {
  //data = [{prob: 0.2, val: 0.2}, {prob: 0.6, val: 0.5}, {prob: 0.2, val: 0.8}];
  data[0].prob = 0.2;
  data[1].prob = 0.6;
  data[2].prob = 0.2;
  if (interval) clearInterval(interval);
  interval = setInterval(reinforce_step, 200);
}

main_div.append("button")
 .text("run")
 .on('click', run);

}
