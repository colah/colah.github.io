---
title: Visualizing Representations
date: 2014-10-15
author: colah
mathjax: on
tags: MNIST, data visualization, machine learning, word embeddings, neural networks, deep learning
---

<script src="js/data/MNIST.js" type="text/javascript"></script>
<script src="js/data/MNIST-SNE-good.js"></script>
<script src="js/data/MNIST-reps.js"></script>

<script src="js/foreign/d3.v3.min.js" charset="utf-8"></script>
<script src="js/foreign/jquery-1.7.0.min.js" charset="utf-8"></script>
<script src="js/foreign/jquery-ui.min.js" charset="utf-8"></script>
<script src="http://threejs.org/build/three.min.js"></script>
<script src="js/foreign/TrackballControls.js"></script>
<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/themes/smoothness/jquery-ui.min.css">
<script src="js/BasicVis.js" type="text/javascript"></script>
<script src="js/MnistVis.js" type="text/javascript"></script>
<script src="js/NetVis.js" type="text/javascript"></script>

<script src="js/data/WikiEmbed-sub5.js"></script>
<script src="js/data/WordEmbed-10000.js"></script>
<script src="js/data/TranslationEnglishEmbed-N1.js"></script>

<style>

.hover_show {
  opacity: 0.0;
}
.hover_show:hover {
  opacity: 0.4;
}

.highlight {
  opacity: 0.55;
}
.highlight:hover {
  opacity: 0.9;
}


</style>

In a [previous post](../2014-10-Visualizing-MNIST/), we explored techniques for visualizing high-dimensional data. Trying to understand high dimensional data is, by itself, very interesting, but my real goal is something else. I think these techniques form a set of basic building blocks to try and understand machine learning, and specifically to understand the internal operations of deep neural networks.

Deep neural networks are an approach to machine learning that has revolutionized computer vision and speech recognition in the last few years, blowing the previous state of the art results out of the water. They've also brought promising results to many other areas, including language understanding and machine translation. Despite this, it remains challenging to understand what, exactly, these networks are doing.

I think that dimensionality reduction, thoughtfully applied, can give us a lot of traction on understanding neural networks.

Neural Networks Transform Space
===========================

Not all neural networks are hard to understand. In fact, low-dimensional neural networks -- networks which have only two or three neurons in each layer -- are quite easy to understand.

Consider the following dataset, consisting of two curves on the plane. Given a point, our network should predict which curve it belongs to.

TODO: belongs?

<div class="centerimgcontainer" style="width:25%;">
<img src="img/simple2_data.png" alt="" style="">
</div>
<div class="spaceafterimg"></div>

A network with just an input layer and an output layer tries to divide the two classes with a straight line.

<br>
<div id="lowdim_svm_layers" style="width: 90%; margin-left:auto; margin-right:auto;"> </div>
<script type="text/javascript">
(function () {
  var test3 = new NetworkLayout("#lowdim_svm_layers");
  test3.layers = [
      {n: 2, label: "input", label2: "(2)"},
      {n: 1, label: "output", label2: "(1 sigmoid)", hide_rep: true}
    ];
  test3.render();
  test3.rep_divs[0].html("<img src=\"img/simple2_linear.png\" style=\"width: 100%; margin: 0px;\"></img>")
})()
</script>
<br>

In the case of this dataset, it is not possible to classify it perfectly by dividing it with a straight line. And so, a network with only an input layer and an output layer can not classify it perfectly.

But, in practice, neural networks have additional layers in the middle, called "hidden" layers. These layers warp and reshape the data to make it easier to classify.

<br>
<div id="lowdim_net_layers" style="width: 90%; margin-left:auto; margin-right:auto;"> </div>
<script type="text/javascript">
(function () {
  var test3 = new NetworkLayout("#lowdim_net_layers");
  test3.layers = [
      {n: 2, label: "input", label2: "(2)"},
      {n: 2, label: "hidden", label2: "(2 sigmoid)"},
      {n: 1, label: "output", label2: "(1 sigmoid)", hide_rep: true}
    ];
  test3.render();
  test3.rep_divs[0].html("<img src=\"img/simple2_0.png\" style=\"width: 100%; margin: 0px;\"></img>")
  test3.rep_divs[1].html("<img src=\"img/simple2_1.png\" style=\"width: 100%; margin: 0px;\"></img>")
})()
</script>
<br>

We call the versions of the data corresponding to different layers *representations*. The input layer's representation is the raw data. The middle "hidden" layer's representation is a warped, easier to classify, version of the raw data.

Low-dimensional neural networks are really easy to reason about because we can just look at their representations, and at how one representation transforms into another. If we have a question about what it is doing, we can just look. (There's quite a bit we can learn from low-dimensional neural networks, as explored in my post [Neural Networks, Manifolds, and Topology](../2014-03-NN-Manifolds-Topology/).)

Unfortunately, neural networks are usually not low-dimensional. The strength of neural networks is classifying high-dimensional data, like computer vision data, which often has tens or hundreds of thousands of dimensions. The hidden representations we learn are also of very high dimensionality.

For example, suppose we are trying to classify MNIST. The input representation, MNIST, is a collection of 784-dimensional vectors! And, even for a very simple network, we'll have a high-dimensional hidden representation. To be concrete, let's use one hidden layer with a hundred sigmoid neurons.

While we can't visualize the high-dimensional representations directly, we *can* visualize them using dimensionality reduction. Below, we look at nearest neighbor graphs of MNIST in its raw form and in a hidden representation from a trained MNIST network.

<br>
<div id="mnist_net_layers" style="width: 90%; margin-left:auto; margin-right:auto;"> </div>
<script type="text/javascript">
(function () {
  var test3 = new NetworkLayout("#mnist_net_layers");
  test3.layers = [
      {n: 1.2*Math.log(784), label: "input", label2: "(784)"},
      {n: 1.2*Math.log(100), label: "hidden", label2: "(100 sigmoid)"},
      {n: 1.2*Math.log(10), label: "output", label2: "(softmax 10)", hide_rep: true}
    ];
  test3.render();
  test3.rep_divs[0].html("<img src=\"img/MNIST-Graph-Raw.png\" style=\"width: 100%; margin: 0px;\"></img>")
  test3.rep_divs[1].html("<img src=\"img/MNIST-Grpah-100.png\" style=\"width: 100%; margin: 0px;\"></img>")
})()
</script>
<br>

At the input layer, the classes are quite tangled. But, by the next layer, because the model has been trained to distinguish the digit classes, the hidden layer has learned to transform the data into a new representation in which the digit classes are much more separated.

This approach, visualizing high-dimensional representations using dimensionality reduction, is an extremely broadly applicable technique for inspecting models in deep learning.

In addition to helping us understand what a neural network is doing, inspecting representations allows us to understand the data itself. Even with sophisticated dimensionality reduction techniques, lots of real world data is incomprehensible -- its structure is too complicated and chaotic. But higher level representations tend to be simpler and calmer, and much easier for humans to understand.


Example 1: Word Embeddings
==========================

Word embeddings are a remarkable kind of representation. They form when we try to solve language tasks with neural networks.

For these tasks, the input to the network is typically a word, or multiple words. Each word can be thought of as a unit vector in a ridiculously high-dimensional space, with each dimension corresponding to a word in the vocabulary. The network warps and compresses this space, mapping words into a couple hundred dimensions. This is called a word embedding.

In a word embedding, every word is a couple hundred dimensional vector. These vectors have some really nice properties. The property we will visualize here is that words with similar meanings are close together.

(These embeddings have lots of other intersting properties, besides proximity. For example, directions in the embedding space seems to have semantic meaning. Further, difference vectors between words seem to encode analogies. For example, the difference between woman and man is approximately the same as the difference between queen and king: $v(``\text{woman}\!") - v(``\text{man}\!") ~\simeq$ $v(``\text{queen}\!") - v(``\text{king}\!")$. For more on word embeddings, see my post [Deep Learning, NLP, and Representations](../2014-07-NLP-RNNs-Representations/).)

To visualize the word embedding in two dimensions, we need to choose a dimensionality reduction technique to use. t-SNE optimizes for keeping points close to their neighbors, so it is the natural tool if we want to visualize which words are close together in our word embedding.

TODO: Example images of classes, try to excite people


<br>
<div id="word_embed" style="width: 100%; position: relative">
<div class="sne" style="width: 65%; margin-left:5%; margin-right:5%;"> </div>
<div class="legend" style="position:absolute; left:75%; top:0; width: 25%; background-color: rgb(220,220,220); border-radius: 10px; padding: 10px 10px; border: 2px solid black; font-size: 75%;">
Color words by <a href="http://wordnet.princeton.edu/">WordNet</a> synset (eg. *region.n.03*):<br><br>
</div>
</div>

<div class="caption">
**A Word Embedding Visualized with t-SNE**<br>
(Hover over a point to see the word.)<br>
([See this with 50,000 points!](big_vis/words.html))
</div>
<br>

<script type="text/javascript">
(function () {
  var embed_vis = new display_embed(word_embedding_data, "#word_embed");
})()
</script>


Looking at the above visualization, we can see lots of clusters, from broad clusters like regions (*region.n.03*) and people (*person.n.01*), to smaller ones like body parts (*body_part.n.01*), units of distance (*linear_unit.n.01*) and food (*food.n.01*). The network successfully learned to put similar words close together.

Example 2: Paragraph Vectors of Wikipedia
=========================================

Paragraph vectors, introduced by [Le & Mikolov (2014)], are vectors that represent chunks of text. Paragraph vectors come in a few variations but the simplest one, which we are using here, is basically some really nice features on top of a [bag of words] representation.

With word embeddings, we learn vectors in order to solve a language task involving the word. With paragraph vectors, we learn vectors in order to predict which words are in a paragraph.

Concretely, the neural network learns a low-dimensional approximation of word statistics for different paragraphs. In the hidden representation of this neural network, we get vectors representing each paragraph. These vectors have nice properties, in particular that similar paragraphs are close together.

More recently Quoc Le and Andrew Dai (2014) trained paragraph vectors for some very interesting data sets. One of these was Wikipedia, creating a vector for every Wikipedia article. I was lucky enough to be able to do visualizations for them.

(TODO: More recent work not yet up on Arxiv????)

Since there are a very large number of wikipedia articles, we visualize a random subset. Again, we use t-SNE, because we want to understand what is close together.

[Le & Mikolov (2014)]: http://arxiv.org/pdf/1405.4053.pdf
[bag of words]: http://en.wikipedia.org/wiki/Bag-of-words_model

TODO: Example images of classes, try to excite people. Maybe as many as 10. Potentially a bunch. Try to get the reader excited.

<br>
<div id="wiki_embed" style="width: 100%; position: relative">
<div class="sne" style="width: 65%; margin-left:5%; margin-right:5%;"> </div>
<div class="legend" style="position:absolute; left:75%; top:0; width: 25%; background-color: rgb(220,220,220); border-radius: 10px; padding: 10px 10px; border: 2px solid black; font-size: 75%;"> Color articles by Wikipedia category (eg. *films*): <br><br> </div>
</div>

<div class="caption">
**Wikipedia Paragraph Vectors Visualized with t-SNE**<br>
(Hover over a point to see the title. Click to open article.)<br>
([See this with 50,000 points!](big_vis/wiki.html))
</div>
<br>

<script type="text/javascript">
(function () {
  //wiki_data.cats = wiki_data.cats.slice(0, 3000);
  var embed_vis = new display_embed(wiki_data, "#wiki_embed");
})()
</script>


This representation does an impressive job at discovering similarities between articles. In the visualization we see gross clusters (eg. *athletic sports* or *albums*), with distinct subclusters (eg. *hockey* and *jazz albums*). There are clusters across the spectrum of topics (eg. *species*, *video games*). Clusters even exist for many highly specific topics (eg. *human proteins* or *communes in france*).

(Note: Wikipedia categories can be quite unintuitive and much broader than you expect. For example, every human is included in the category *applied ethics* because humans are in *people* which is in *personhood* which is in *issues in ethics* which is in *applied ethics*.)

Example 3: Translation Model
=========================================

The previous two examples have been, while fun, kind of strange. They were both produced by networks doing simple contrived tasks that we don't actually care about, with the goal of creating nice representations. The representations they produce are really cool and useful... But they don't do too much to validate our approach to understanding neural networks.

Let's look at a cutting edge network doing a real task: translating English to French.

[Sutskever *et al.* (2014)] translate English sentences into French sentences using two recurrent neural networks. The first consumes the English sentence, word by word, to produce a representation of it, and the second takes the representation of the English sentence and sequentially outputs translated words. The two are jointly trained, and use a multilayered [Long Short Term Memory] architecture.[^ReverseModel]

[^ReverseModel]:
   It should be noted that, later, Sutskever *et al.* switched to reversing the order of the input sentence, finding this improved their results.
   <br>
   <img src="img/Translation2-Backwards.png" style="width: 80%; margin-left:auto; margin-right:auto;"> </img>

<br>
<div style="width: 95%; margin-left:auto; margin-right:auto;">
<img src="img/Translation2-RepArrow.png" style="width: 100%; margin: 0;"> </img>
</div>
<br>

We can look at the representation right after the English "end of sentence" (EOS) symbol to get a representation of the English sentence. This representation is actually quite a remarkable thing. Somehow, from an English sentence, we've formed a vector that encodes the information we need to create a French version of that sentence.

Let's give this representation a closer look with t-SNE.

<br>
<div id="translation_embed" style="width: 100%; position: relative">
<div class="sne" style="width: 65%; margin-left:5%; margin-right:5%;"> </div>
<div class="legend" style="position:absolute; left:75%; top:0; width: 25%; background-color: rgb(220,220,220); border-radius: 10px; padding: 10px 10px; border: 2px solid black; font-size: 75%;">
Color sentences by first word (eg. The):
<br><br> </div>
</div>

<div class="caption">
**Translation representation of sentences visualized with t-SNE**<br>
(Hover over a point to see the sentence.)
</div>
<br>

<script type="text/javascript">
(function () {
  //wiki_data.cats = wiki_data.cats.slice(0, 3000);
  var embed_vis = new display_embed(translation_data, "#translation_embed", true);
})()
</script>


This visualization revealed something that was fairly surprising to us: the representation is dominated by the first word.

If you look carefully, there's a bit more structure than just that. In some places, we can see subclusters corresponding to the second word (for example, in the quotes cluster, we see subclusters for "I" and "We"). In other places we can see sentences with similar first words mix together (eg. "This" and "That"). But by and large, the sentence representation is controlled by the first word.

There are a few reasons this might be the case. The first is that, at the point we grab this representation, the network is giving the first translated word, and so the representation may strongly emphasize the information it needs at that instant. It's also possible that the first word is much harder than the other words to translate because, for the other words, it is allowed to know what the previous word in the translation was and can kind of Markov chain along.

Still, while there are reasons for this to be the case, it was pretty surprising. I think there must be lots of cases like this, where a quick visualization would reveal surprising insights into the models we work with. But, because visualization is inconvenient, we don't end up seeing them.

[Sutskever *et al.* (2014)]: http://arxiv.org/pdf/1409.3215v1.pdf
[Long Short Term Memory]: http://en.wikipedia.org/wiki/Long_short_term_memory


Aside: Patterns for Visualizing High-Dimensional Data
=====================================================

There are a lot of established best practices for visualizing low dimensional data. Many of these are even taught in school. "Label your axes." "Put units on the axes." And so on. These are excellent practices for visualizing and communicating low-dimensional data.

Unfortunately, they aren't as helpful when we visualize high-dimensional data. Label the axes of a t-SNE plot? The axes don't really have any meaning, nor are the units very meaningful. The only really meaningful thing, in a t-SNE plot, is which points are close together.

There are also some unusual challenges when doing t-SNE plots. Consider the following t-SNE visualization of word embeddings. Look at the cluster of male names on the left hand side...

<div id="bad_word_sne" style="width: 45%; margin-left:auto; margin-right:auto;"> </div>
<div class="caption">**A Word Embedding Visualized with t-SNE**<br>(This visualization is deliberately terrible.)</div>
<script type="text/javascript">
(function () {
  var sne = word_embedding_data["vs_sne"];
  var scatter = new BasicVis.ScatterPlot("#bad_word_sne")
    .N(sne.length/2)
    //.enable_zoom()
    .xrange.fit(sne)
    .yrange.fit(sne)
    .x(function(i) {return sne[2*i  ];})
    .y(function(i) {return sne[2*i+1];})
    .size(2.3)
    .color(function(i){
      return "rgba(150,150,150,0.2)";
    });
})()
</script>
<br>

... but you can't look at the cluster of male names on the left hand side. (It's frustrating not to be able to hover, isn't it?) While the points are in the exact same positions as in our earlier visualization, without the ability to look at which words correspond to points, this plot is essentially *useless*. At best, we can look at it and say that the data probably isn't random.

The problem is that in dimensionality reduced plots of high-dimensional data, position doesn't explain the data points. This is true even if you understand precisely what the plot you are looking at is.

Well, we can fix that. Let's add back in the tooltip. Now, by hovering over points you can see what word the correspond to. Why don't you look at the body part cluster?

<div id="less_bad_word_sne" style="width: 45%; margin-left:auto; margin-right:auto;"> </div>
<div class="caption">**A Word Embedding Visualized with t-SNE**<br>(This visualization is deliberately terrible, but less than the previous one.)</div>
<script type="text/javascript">
(function () {
  var sne = word_embedding_data["vs_sne"];
  var toks = word_embedding_data["toks"];
  var scatter = new BasicVis.ScatterPlot("#less_bad_word_sne")
    .N(sne.length/2)
    //.enable_zoom()
    .xrange.fit(sne)
    .yrange.fit(sne)
    .x(function(i) {return sne[2*i  ];})
    .y(function(i) {return sne[2*i+1];})
    .size(2.3)
    .color(function(i){
      return "rgba(150,150,150,0.2)";
    });

  setTimeout(function() {
    var a = new BasicVis.TextTooltip();
    a._labels = toks;
    a.bind(scatter.points);
    a.bind_move(scatter.s);
    a.div.style("font-size", "85%");
  }, 50);
})()
</script>
<br>

You are forgiven if you didn't have the patience to look at several hundred data points in order to find the body part cluster. And, unless you remembered where it was from before, that's the effort one would expect it to take you.

The ability to inspect points is not sufficient. When dealing with thousands of points, one needs a way to quickly get a high-level view of the data, and then drill in on the parts that are interesting.

This brings us to my personal theory of visualizing high dimensional data (based on my whole three months of working on visualizing it):

(1) There must be a way to interrogate individual data points.
(2) There must be a way to get a high-level view of the data.

Interactive visualizations are a really easy way to get both of these properties. But they aren't the only way. There's a really beautiful visualization of MNIST in the original t-SNE paper, [Maaten & Hinton (2008)], on the page labeled 2596:

<br>
<div style="width: 80%; margin-left:auto; margin-right:auto;">
<img src="img/MNIST-tSNE-DigitsInImage.png" style="width: 100%; margin: 0;"> </img>
</div>
<div class="caption">**MNIST Visualized with t-SNE**<br> (partial image from [Maaten & Hinton (2008)])</div>
<br>

By directly embedding every MNIST digit's image in the visualization, Maaten and Hinton made it very easy to inspect individual points. Further, from the 'texture' of clusters, one can also quickly recognize their nature.

Unfortunately, that approach only works because MNIST images are small and simple. In their exciting paper on phrase representations, [Cho *et al.* (2014)] include some very small subsections of a t-SNE visualization of phrases:


<br>
<div style="width: 60%; margin-left:auto; margin-right:auto;">
<img src="img/Cho-TimePhrase-TSNE.png " style="width: 100%; margin: 0;"> </img>
</div>
<div class="caption">**Phrases Visualized with t-SNE**<br> (from [Cho *et al.* (2014)])</div>
<br>

Unfortunately, embedding the phrases directly in the visualization just doesn't work. They're too large and clunky. Actually, I just don't see any good way to visualize this data without using interactive media. 

[Maaten & Hinton (2008)]: http://jmlr.org/papers/volume9/vandermaaten08a/vandermaaten08a.pdf
[Cho *et al.* (2014)]: http://arxiv.org/pdf/1406.1078v1.pdf

Geometric Fingerprints
============================

Now that we've looked at a bunch of exciting representations, let's return to our simple MNIST networks and examine the representations they form. We'll use PCA for dimensionality reduction now, since it will allow us to observe some interesting geometric properties of these representations, and because it is less stochastic than the other dimensionality reduction algorithms we've discussed.

The following network has a 5 unit sigmoid layer. Such a network would never be used in practice, but is a bit fun to look at.

<br>
<div id="mnist_net5_layers" style="width: 90%; margin-left:auto; margin-right:auto;"> </div>
<script type="text/javascript">
(function () {
  var test3 = new NetworkLayout("#mnist_net5_layers");
  test3.layers = [
      {n: 1.2*Math.log(784), label: "input", label2: "(784)"},
      {n: 1.2*Math.log(5), label: "hidden", label2: "(5 sigmoid)"},
      {n: 1.2*Math.log(10), label: "output", label2: "(softmax 10)", hide_rep: true}
    ];
  test3.render();
  test3.rep_divs[0].html("<img src=\"img/MNIST-PCA-raw.png\" style=\"width: 100%; margin: 0px;\"></img>")
  test3.rep_divs[1].html("<img src=\"img/MNIST-PCA-Sigmoid5.png\" style=\"width: 100%; margin: 0px;\"></img>")
})()
</script>
<br>

Then network's hidden representation looks like a projection of a high-dimensional cube. Why? Well, sigmoid units tend to give values close to 0 or 1, and less frequently anything in the middle. If you do that in a bunch of dimensions, you end up with concentration at the corners of a high-dimensional cube and, to a lesser extent, along its edges. PCA then projects this down into two dimensions.

This cube-like structure is a kind of geometric fingerprint of sigmoid layers. Do other activation functions have a similar geometric fingerprint? Let's look at a ReLU layer.

<br>
<div id="mnist_netR5_layers" style="width: 90%; margin-left:auto; margin-right:auto;"> </div>
<script type="text/javascript">
(function () {
  var test3 = new NetworkLayout("#mnist_netR5_layers");
  test3.layers = [
      {n: 1.2*Math.log(784), label: "input", label2: "(784)"},
      {n: 1.2*Math.log(5), label: "hidden", label2: "(5 ReLU)"},
      {n: 1.2*Math.log(10), label: "output", label2: "(softmax 10)", hide_rep: true}
    ];
  test3.render();
  test3.rep_divs[0].html("<img src=\"img/MNIST-PCA-raw.png\" style=\"width: 100%; margin: 0px;\"></img>")
  test3.rep_divs[1].html("<img src=\"img/MNIST-PCA-R5.png\" style=\"width: 100%; margin: 0px;\"></img>")
})()
</script>
<br>

Because ReLU's have a high probability of being zero, lots of points concentrate on the origin, and along axes. Projected into two dimensions, it looks like a bunch of "spouts" shooting out from the origin.

These geometric properties are much more visible when there are only a few neurons.


The Space of Representations
============================

Every time we train a neural net, we get new representations. This is true even if we train the same network multiple times. The result is that it is very easy to end up with lots of representations of a dataset.

We rarely look at any of these representations, but if we want to, it's pretty easy to make visualizations of all of them. Here's a bunch to look at.

<br>
<div id="mnist_reps" style="width: 90%; margin-left:auto; margin-right:auto;"> </div>
<br>
<div class="caption">
**The Many Representations of MNIST**
</div>
<br>

<script type="text/javascript">
var explore;
(function () {
    explore = new PlotDataMNIST("#mnist_reps");
    explore.bindToWindowResize();
    explore.data(friendly_reps);

    setTimeout(function() {
      var a = new BasicVis.ImgTooltip();
      a.img_display.shape([28,28]);
      a.img_display.imgs(mnist_xs);
      a.bind(explore.scatter.points);
      a.bind_move(explore.scatter.s);
    }, 50);
})()
</script>

Now, while we can visualize a lot of representations like this, it isn't terribly helpful. What do we learn from it? Not much. We have lots of particular representations, but it's hard to compare them or get a big picture view.

Let's focus on comparing representations for a moment. The tricky thing about this is that fundamentally similar neural networks can be very different in ways we don't care about. Two neurons might be switched. The representation could be rotated or flipped.


<br>
<div style = "width:55%; position: relative; margin: 0 auto;">
<img src="./img/MNIST-PCA-Conv1.png" style="width: 45%; left:0%; border: 1px solid rgb(0, 0, 0);">
<img src="./img/MNIST-PCA-Conv2.png" style="position: absolute; width: 45%; left:55%; border: 1px solid rgb(0, 0, 0);">
</div>
<div class="caption">
**Two very similar representations, except for a flip**
</div>
<br>

We want to, somehow, forget about these unimportant differences and focus only on the important differences. We want a canonical form for representations, that encodes only meaningful differences.

Distance seems fundamental, here. All of these unimportant differences are isometries -- that is, transformations like rotation or switching two dimensions do not change the distances between points. On the other hand, distance between points is *really* important: things being close together is a representations way of saying that they are similar, and things being far apart is a representation saying they are different.

Thankfully, there's an easy way to forget about isometries. For a representation $X$, there's an associated metric function, $d_X$, which gives us the distance between pairs of points within that representation. For another representation $Y$, $d_X = d_Y$ if and only if $X$ is isomorphic to $Y$. The metric functions encode precisely the information we want!

We can't really work with $d_X$ because it is actually a very high-dimensional object. We need to discretize it for it to be useful.

TODO: Be more clear about discretized; think about what dimension should mean here

$$D_X = \left[\begin{array}{cccc} 
  d_X(x_0, x_0) & d_X(x_1, x_0) & d_X(x_2, x_0) & ... \\
  d_X(x_0, x_1) & d_X(x_1, x_1) & d_X(x_2, x_1) & ... \\
  d_X(x_0, x_2) & d_X(x_1, x_2) & d_X(x_2, x_2) & ... \\
  ... & ... & ... & ... \\ 
\end{array} \right]$$

One thing we can do with $D_X$ is flatten it to get a vector encoding the properties of the representation $X$. We can do this for a lot of representations, and we get a collection of high-dimensional vectors.

The natural thing to do, of course, is to apply dimensionality reduction to our representations.

In the following visualization, there are three boxes. The largest one, on the left, visualizes the space of representations, with every point corresponding to a representation. The points are positioned by dimensionality reduction of the flattened distance matrices, as above. One way to think about this that distance between representations in the visualization represents how much they disagree on which points are similar and which points are different. 

Next, the middle box is a regular visualization of a representation of MNIST, like the many we've seen previously. It displays which ever representation you hover over in left box. Finally, the right most box displays particular MNIST digits, depending on which point you hover over in the middle box.

<br>
<div style="width: 90%; margin-left:auto; margin-right:auto;">
<div id="mnist_space" style="margin-left:auto; margin-right:auto;"> </div>
<br>
<div class="caption">
**The Space of MNIST Representations**<br>
<b>Left:</b> Visualization of representations, points are representations.
<b>Middle:</b> Visualization of a particular representation, points are MNIST data points.
<b>Right:</b> Image of a particular data point.
</div>
</div>
<br>

<script type="text/javascript">
(function () {
  var mnist_space = new RepresentationSpacePlotMNIST("#mnist_space");
})()
</script>

TODO: Human friendly titles for reps

This visualization shifts us from looking at trees to seeing the forest. It moves us from looking at representations, to looking at the space of representations. It's a step up [the ladder of abstraction](http://worrydream.com/LadderOfAbstraction/).

Imagine training a neural network and watching its representations wander through this space. You can see how your representations compare to other "landmark" representations from past experiments. If your model's first layer representation is in the same place a really successful model's was during training, that's a good sign! If it's veering off towards a cluster you know had too high learning rates, you know you should lower it. This can give us *qualitative feedback* during neural network training.

It also allows us to ask whether two models which achieve comparable results are doing similar things internally or not.

Deep Learning for Visualization
================================




Visualization for Deep Learning
================================





