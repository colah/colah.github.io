/*var i = 0;

var data = new Float32Array(100);

function timedCount() {
    i = i + 1;
    postMessage({ msg: "update", embed: data});
    setTimeout("timedCount()",500);
}

timedCount();*/


var cost = null;
var xs = null, N = null, D = null, Kstep = 1, Kmu = 1;
var ds_orig = null;
var ds_graph = null;
var grad = null;
var momentum = null;
var embed = null;
var edges = [];
var temp = null;
var pij = null;
var qij = null;

var normal = function() {
  var N = 15, x = 0;
  for (var n = 0; n < N; n++) {
    x += Math.random();
  }
  x = 2*x - N;
  x = x/N;
  return x;
};

function calc_ds() {
  for (var i = 0; i < N; i++)
  for (var j = 0; j < N; j++) {
    var sum = 0;
    for (var d = 0; d < D; d++){
      var diff = xs[D*i + d] - xs[D*j + d];
      sum += diff*diff;
    }
    ds_orig[i + N*j] = Math.sqrt(sum);
  }
}

function normalize(arr, N) {
    var sum = 0;
    for (var m = 0; m < N; m++)
      sum += arr[m];
    if (sum > 0) {
      for (var m = 0; m < N; m++)
        arr[m] /= sum;
    }
}

function const_variance(k) {
  for (var n = 0; n < N; n++) {
    variances[n] = k;
  }
}

function calc_perps(target) {
  function test_perp(n, s) {
    for (var m = 0; m < N; m++) {
      var d = ds_orig[n+N*m];
      temp[m] = Math.exp(-d*d/2/s/s);
    }
    temp[n] = 0;
    normalize(temp, N);
    var entropy = 0;
    for (var m = 0; m < N; m++)
      entropy += temp[m] * Math.log(temp[m]+0.000001)
    entropy *= -1/Math.log(2);
    return Math.pow(2, entropy);
  }
  for (var n = 0; n < N; n++) {
    var var0 =  0.1, perp0 = test_perp(0.1),
        var1 = 10.0, perp1 = test_perp(10.0);
    var mid;
    for (var k = 0; k < 10; k++) {
      mid = (var0 + var1)/2.0;
      var mid_perp = test_perp(n, mid);
      if (mid_perp < target){
        var0 = mid; perp0 = mid_perp;
      } else {
        var1 = mid; perp1 = mid_perp;
      }
    }
    variances[n] = mid;
  }

}

function calc_pij() {
  for (var n = 0; n < N; n++) {
    var s = variances[n];
    for (var m = 0; m < N; m++) {
      var d = ds_orig[n+N*m];
      temp[m] = Math.exp(-d*d/2/s/s);
    }
    temp[n] = 0;
    normalize(temp, N);
    for (var m = 0; m < N; m++) {
      pij[N*n+m] = temp[m];
    }
  }
}

function calc_pij_sym() {
  calc_pij();
  for (var i = 0; i < N; i++)
  for (var j = 0; j < i; j++) {
    pij[N*i+j] += pij[N*j+i];
    pij[N*i+j] /= 2*N;
    pij[N*j+i]  = pij[N*i+j];
  }
  /*for (var n = 0; n < N; n++) {
    var s = variances[n];
    for (var m = 0; m < N; m++) {
      var d = ds_orig[n+N*m];
      pij[N*n+m][m] = Math.exp(-d*d/2/s/s);
    }
    temp[n] = 0;
  }
  normalize(pij, N*N);*/
}

function calc_qij() {
  for (var n = 0; n < N; n++) {
    for (var m = 0; m < N; m++) {
      var x1 = embed[3*n  ], x2 = embed[3*m];
      var y1 = embed[3*n+1], y2 = embed[3*m+1];
      var z1 = embed[3*n+2], z2 = embed[3*m+2];
      var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
      var d2 = dx*dx + dy*dy + dz*dz;
      temp[m] = Math.exp(-d2/2);
    }
    temp[n] = 0;
    normalize(temp, N);
    for (var m = 0; m < N; m++) {
      qij[N*n+m] = temp[m];
    }
  }
}

function calc_qij_sym() {
  for (var n = 0; n < N; n++) {
    for (var m = 0; m < N; m++) {
      var x1 = embed[3*n  ], x2 = embed[3*m];
      var y1 = embed[3*n+1], y2 = embed[3*m+1];
      var z1 = embed[3*n+2], z2 = embed[3*m+2];
      var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
      var d2 = dx*dx + dy*dy + dz*dz;
      qij[N*n+m] = Math.exp(-d2/2);
    }
    qij[n] = 0;
  }
  normalize(qij, N*N);
}

function calc_qij_sym_t() {
  for (var n = 0; n < N; n++) {
    for (var m = 0; m < N; m++) {
      var x1 = embed[3*n  ], x2 = embed[3*m];
      var y1 = embed[3*n+1], y2 = embed[3*m+1];
      var z1 = embed[3*n+2], z2 = embed[3*m+2];
      var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
      var d2 = dx*dx + dy*dy + dz*dz;
      qij[N*n+m] = 1.0/(1+d2);
    }
    temp[n] = 0;
  }
  normalize(qij, N*N);
}


function calc_ds_graph() {
  function is_edge(p) {
    for (var n = 0; n < edges.length; n++) {
      var edge = edges[n];
      if (edge[0] == p[0] && edge[1] == p[1])// || edge[0] == p[1] && edge[1] == p[0])
        return true;
    }
    return false;
  }
  for (var i = 0; i < N; i++)
  for (var j = 0; j < N; j++) {
    if ( is_edge([i,j]) || is_edge([j,i]) ) {
      ds_graph[i + N*j] = ds_orig[i + N*j];
    } else {
      ds_graph[i + N*j] = 10000;
    }
  }
  for (var m = 0; m < N; m++)
  for (var i = 0; i < N; i++)
  for (var j = 0; j < N; j++) {
    var d_path = ds_graph[i + N*m] + ds_graph[m + N*j];
    if (d_path < ds_graph[i + N*j]) {
      ds_graph[i + N*j] = d_path;
    }
  }

}

function threshold_edges(thresh){
  edges = [];
  for (var i = 0; i < N; i++)
  for (var j = 0; j < i; j++) {
    if (ds_orig[i + N*j] < thresh) {
      edges.push([i,j]);
    }
  }
}

function knn_edges(K){
  edges = [];
  for (var i = 0; i < N; i++) {
    var knn = [];
    // stupid, dumb, easy hack for testing:
    for (var k = 0; k < K; k++) {
      var x = null, xd = 100000;
      for (var j = 0; j < N; j++) {
        var D = ds_orig[i + N*j];
        if ( i!=j && knn.indexOf(j) == -1 && D < xd) {
          x = j;
          xd = D;
        }
      }
      knn.push(x);
      edges.push([i, x]);
    }
  }
}

function opt(cost){

  // Set Gradient to zero
  for (var i = 0; i < N; i++) {
    grad[3*i] = 0;
    grad[3*i+1] = 0;
    grad[3*i+2] = 0;
  }

  // Calculate new gradient
  if (cost == "MDS") {
    for (var i = 0; i < N; i++)
    for (var j = 0; j < i; j++) {
      var D = ds_orig[i + N*j];
      var x1 = embed[3*i  ], x2 = embed[3*j];
      var y1 = embed[3*i+1], y2 = embed[3*j+1];
      var z1 = embed[3*i+2], z2 = embed[3*j+2];
      var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
      var d2 = dx*dx + dy*dy + dz*dz;
      var d = Math.sqrt(d2) + 0.001;
      var K = 2*(d-D)/d;
      grad[3*i  ] += K*dx;
      grad[3*i+1] += K*dy;
      grad[3*i+2] += K*dz;
      grad[3*j  ] -= K*dx;
      grad[3*j+1] -= K*dy;
      grad[3*j+2] -= K*dz;
    }
  } else if (cost == "sammon") {
    for (var i = 0; i < N; i++)
    for (var j = 0; j < i; j++) {
      var D = ds_orig[i + N*j];
      var x1 = embed[3*i  ], x2 = embed[3*j];
      var y1 = embed[3*i+1], y2 = embed[3*j+1];
      var z1 = embed[3*i+2], z2 = embed[3*j+2];
      var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
      var d2 = dx*dx + dy*dy + dz*dz;
      var d = Math.sqrt(d2) + 0.001;
      var K = 2*(d-D)/d/D;
      grad[3*i  ] += K*dx;
      grad[3*i+1] += K*dy;
      grad[3*i+2] += K*dz;
      grad[3*j  ] -= K*dx;
      grad[3*j+1] -= K*dy;
      grad[3*j+2] -= K*dz;
    }
  } else if (cost == "MDS_exp") {
    for (var i = 0; i < N; i++)
    for (var j = 0; j < i; j++) {
      var D = ds_orig[i + N*j];
      var x1 = embed[3*i  ], x2 = embed[3*j];
      var y1 = embed[3*i+1], y2 = embed[3*j+1];
      var z1 = embed[3*i+2], z2 = embed[3*j+2];
      var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
      var d2 = dx*dx + dy*dy + dz*dz;
      var d = Math.sqrt(d2) + 0.001;
      if (D > d) {
        var K = 2*(d-D)/d;
      } else {
        var K = 2*(d-D)/d*25/D/D;
      }
      grad[3*i  ] += K*dx;
      grad[3*i+1] += K*dy;
      grad[3*i+2] += K*dz;
      grad[3*j  ] -= K*dx;
      grad[3*j+1] -= K*dy;
      grad[3*j+2] -= K*dz;
    }
  } else if (cost == "SNE_sym") {
    calc_qij_sym();
    for (var i = 0; i < N; i++)
    for (var j = 0; j < N; j++) {
      if (i != j) {
        var x1 = embed[3*i  ], x2 = embed[3*j];
        var y1 = embed[3*i+1], y2 = embed[3*j+1];
        var z1 = embed[3*i+2], z2 = embed[3*j+2];
        var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
        var K = 4*(pij[N*i+j] - qij[N*i+j] );
        grad[3*i  ] += K*dx;
        grad[3*i+1] += K*dy;
        grad[3*i+2] += K*dz;
      }
    }
  } else if (cost == "tSNE") {
    calc_qij_sym_t();
    for (var i = 0; i < N; i++)
    for (var j = 0; j < N; j++) {
      if (i != j) {
        var x1 = embed[3*i  ], x2 = embed[3*j];
        var y1 = embed[3*i+1], y2 = embed[3*j+1];
        var z1 = embed[3*i+2], z2 = embed[3*j+2];
        var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
        var d2 = dx*dx + dy*dy + dz*dz;
        var K = 4*(pij[N*i+j] - qij[N*i+j] )/(1+d2);
        grad[3*i  ] += K*dx;
        grad[3*i+1] += K*dy;
        grad[3*i+2] += K*dz;
      }
    }
  } else if (cost == "graph") {
    for (var i = 0; i < N; i++)
    for (var j = 0; j < i; j++) {
      var x1 = embed[3*i  ], x2 = embed[3*j];
      var y1 = embed[3*i+1], y2 = embed[3*j+1];
      var z1 = embed[3*i+2], z2 = embed[3*j+2];
      var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
      var d2 = dx*dx + dy*dy + dz*dz;
      var d = Math.sqrt(d2) + 0.001;
      var K = -1/d/d;
      grad[3*i  ] += K*dx;
      grad[3*i+1] += K*dy;
      grad[3*i+2] += K*dz;
      grad[3*j  ] -= K*dx;
      grad[3*j+1] -= K*dy;
      grad[3*j+2] -= K*dz;
    }
    for (var n in edges) {
      var i = edges[n][0], j = edges[n][1];
      var x1 = embed[3*i  ], x2 = embed[3*j];
      var y1 = embed[3*i+1], y2 = embed[3*j+1];
      var z1 = embed[3*i+2], z2 = embed[3*j+2];
      var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
      var d2 = dx*dx + dy*dy + dz*dz;
      var d = Math.sqrt(d2) + 0.001;
      var K = 10*(d-1);
      grad[3*i  ] += K*dx;
      grad[3*i+1] += K*dy;
      grad[3*i+2] += K*dz;
      grad[3*j  ] -= K*dx;
      grad[3*j+1] -= K*dy;
      grad[3*j+2] -= K*dz;
    }
  } else if (cost == "graph_ds") {
    for (var i = 0; i < N; i++)
    for (var j = 0; j < i; j++) {
      var x1 = embed[3*i  ], x2 = embed[3*j];
      var y1 = embed[3*i+1], y2 = embed[3*j+1];
      var z1 = embed[3*i+2], z2 = embed[3*j+2];
      var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
      var d2 = dx*dx + dy*dy + dz*dz;
      var d = Math.sqrt(d2) + 0.001;
      var K = -1/d/d;
      grad[3*i  ] += K*dx;
      grad[3*i+1] += K*dy;
      grad[3*i+2] += K*dz;
      grad[3*j  ] -= K*dx;
      grad[3*j+1] -= K*dy;
      grad[3*j+2] -= K*dz;
    }
    for (var n in edges) {
      var i = edges[n][0], j = edges[n][1];
      var D = ds_orig[i + N*j];
      var x1 = embed[3*i  ], x2 = embed[3*j];
      var y1 = embed[3*i+1], y2 = embed[3*j+1];
      var z1 = embed[3*i+2], z2 = embed[3*j+2];
      var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
      var d2 = dx*dx + dy*dy + dz*dz;
      var d = Math.sqrt(d2) + 0.001;
      var K = 10*(d-D*D/25)*D*D/25;
      grad[3*i  ] += K*dx;
      grad[3*i+1] += K*dy;
      grad[3*i+2] += K*dz;
      grad[3*j  ] -= K*dx;
      grad[3*j+1] -= K*dy;
      grad[3*j+2] -= K*dz;
    }
  }

  // Calculate gradient norm
  var grad_norm = 0.0;
  for (var i = 0; i < N; i++) {
    grad_norm += grad[3*i  ]*grad[3*i  ];
    grad_norm += grad[3*i+1]*grad[3*i+1];
    grad_norm += grad[3*i+2]*grad[3*i+2];
  }
  grad_norm = Math.sqrt(grad_norm);

  // Update!
  for (var i = 0; i < N; i++) {
    var Kmu2 = (1-Kmu)/grad_norm;
    momentum[3*i]   = Kmu*momentum[3*i]   + Kmu2*grad[3*i];
    momentum[3*i+1] = Kmu*momentum[3*i+1] + Kmu2*grad[3*i+1];
    momentum[3*i+2] = Kmu*momentum[3*i+2] + Kmu2*grad[3*i+2];
  }

  for (var i = 0; i < N; i++) {
    var K = 0.002*Math.sqrt(N/(0.1+grad_norm));
    embed[3*i]   += Kstep*momentum[3*i];
    embed[3*i+1] += Kstep*momentum[3*i+1];
    embed[3*i+2] += Kstep*momentum[3*i+2];
  }

}


self.onmessage = function(e) {
  data = e.data
  switch (data.cmd) {
    case "init":

      xs = data.xs;
      N = data.N;
      D = data.D;

      cost = data.cost || "MDS";

      ds_orig = new Float32Array(N*N);
      grad = new Float32Array(3*N);
      momentum = new Float32Array(3*N);
      embed = new Float32Array(3*N);

      for (var n = 0; n < embed.length; n++) {
        embed[n] = normal();
      }

      calc_ds();

      if (cost == "graph") {
        //knn_edges(3);
        //threshold_edges(5.0);
        knn_edges(3);
      } else if (cost == "graph_ds") {
        knn_edges(3);
      }  else if (cost == "isomap") {
        knn_edges(3);
        ds_graph = new Float32Array(N*N);
        calc_ds_graph();
        ds_orig = ds_graph;
        postMessage({msg: "info", ds_graph: ds_graph})
        cost = "MDS";
      }  else if (cost == "SNE") {
        temp = new Float32Array(N);
        pij  = new Float32Array(N*N);
        qij  = new Float32Array(N*N);
        variances = new Float32Array(N);
        calc_perps(40);
        calc_pij();
      } else if (cost == "SNE_sym") {
        temp = new Float32Array(N);
        pij  = new Float32Array(N*N);
        qij  = new Float32Array(N*N);
        variances = new Float32Array(N);
        calc_perps(data.perplexity || 20);
        calc_pij_sym();
      } else if (cost == "tSNE") {
        temp = new Float32Array(N);
        pij  = new Float32Array(N*N);
        qij  = new Float32Array(N*N);
        variances = new Float32Array(N);
        calc_perps(40);
        calc_pij_sym();
      }

      postMessage({ msg: "ready"});
      postMessage({msg: "edges", edges: edges})
      postMessage({ msg: "update", embed: embed});
      break;

    case "reset":
      for (var n = 0; n < embed.length; n++) {
        embed[n] = 8*normal();
      }
      postMessage({ msg: "update", embed: embed});
      break;

    case "run":

      var steps = data.steps;
      var skip = data.skip || 1;
      Kstep = data.K_step || data.Kstep || data.K || 1.0;
      Kmu   = data.K_mu   || data.Kmu             || 0.0;

      for (var n = 0; n < steps; n++) {
        if (n % skip == 0) {
          postMessage({ msg: "update", embed: embed});
        }
        opt(cost);
      }

      postMessage({ msg: "update", embed: embed});
      postMessage({ msg: "done"});
      break;

  }
}
