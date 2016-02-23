var dataset = require('./dataset');
var knn = require('./knn');
var testing = require('./testing');

var randgen = require('randgen');
var pearson = require('./pearson-correlation');

// 1. Variance of cross-validation
var sample_sizes = [10, 50, 100, 500];

// for the first part we'll have only one feature
var features = ['feature_0'];
var target = ['output'];

// storing results
var results = {};

for (var i in sample_sizes) {
  results[sample_sizes[i]] = [];
  console.log('Sample size of', sample_sizes[i]);
  // repeating 100 times
  for (var j = 0; j < 100; j++) {
    var data = dataset.random_dataset(sample_sizes[i], 1, [1, -1]);

    // testing with leave-one-out
    results[sample_sizes[i]][j] = testing.leaveOneOut(3, data, features, target, knn.predictClassification);
  }
  console.log(JSON.parse(JSON.stringify(results[sample_sizes[i]])));
}

// getting only c_index for our `output` attribute
var c_index = {};
for (var i in results) {
  c_index[i] = [];
  for (var j in results[i]) {
    c_index[i].push(results[i][j].c_index.output);
  }
}

for (var i in c_index) {
  console.log('C-index for', i, 'sample size');
  for (var j in c_index[i]) {
    console.log(c_index[i][j]);
  }
  console.log();
}

for (var i in results) {
  console.log('Errors mean for', i, 'sample size');
  for (var j in results[i]) {
    console.log(results[i][j].mean.output)
  }
  console.log()
}

for (var i in results) {
  console.log('Errors variance for', i, 'sample size');
  for (var j in results[i]) {
    console.log(results[i][j].variance.output)
  }
  console.log()
}

// generating histogram data
// var histogram = {};
// for (var i in c_index) {
//   histogram[i] = randgen.histogram(c_index[i]);
// }
// console.log(histogram)

// 2. Mis-using feature selection
// 2.1 Cross-validation and feature selection the wrong way

var c_index_wrong = [];
var c_index_right = [];
// repeating 100 times just to check how it goes
for (var i = 0; i < 100; i++) {
  console.log('Cross-validation and feature selection the wrong way');
  var data = dataset.random_dataset(50, 1000, [1, -1]);

  var features = testing.feature_selection(data, ['output'], 10);
  var target = ['output'];

  var result1 = testing.leaveOneOut(3, data, features, target, knn.predictClassification);
  c_index_wrong.push(result1.c_index.output);
  console.log(result1)

  // 2.1 Cross-validation and feature selection the right way
  console.log('Cross-validation and feature selection the right way');
  var result2 = testing.leaveOneOutFS(3, data, 10, target, knn.predictClassification);
  c_index_right.push(result2.c_index.output);
  console.log(result2)
  console.log()
}

// console.log(randgen.histogram(c_index_wrong));
// console.log(randgen.histogram(c_index_right));

console.log('C-index wrong way');
for (var i in c_index_wrong) {
  console.log(c_index_wrong[i]);
}

console.log('C-index right way');
for (var i in c_index_right) {
  console.log(c_index_right[i]);
}
